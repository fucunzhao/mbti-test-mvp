"""
MBTI 故事测 - FastAPI 后端
适配 Supabase + Zeabur 部署

运行：uvicorn server:app --host 0.0.0.0 --port 8000
部署：Zeabur 自动检测 requirements.txt
"""
import os, json, hashlib, secrets, httpx
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ===== Supabase 配置 =====
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")  # service_role key
SUPABASE_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

# ===== 微信支付配置（待小程序注册后填入）=====
WX_APPID = os.environ.get("WX_APPID", "")
WX_MCHID = os.environ.get("WX_MCHID", "")
WX_KEY = os.environ.get("WX_KEY", "")

app = FastAPI(title="MBTI故事测 API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# ===== 数据模型 =====
class WxLoginReq(BaseModel):
    code: str

class SubmitAnswersReq(BaseModel):
    mode: str  # quick / full
    answers: list  # ["a","b","a",...]
    result_type: str
    ei: str; sn: str; tf: str; jp: str
    ei_score: int; sn_score: int; tf_score: int; jp_score: int

class CreateOrderReq(BaseModel):
    answer_id: int

# ===== Supabase 工具函数 =====
async def supabase_query(method: str, path: str, data: dict = None):
    """调用 Supabase REST API"""
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    async with httpx.AsyncClient() as client:
        resp = await client.request(method, url, headers=SUPABASE_HEADERS, json=data)
        if resp.status_code >= 400:
            raise HTTPException(502, f"Supabase error: {resp.text}")
        return resp.json() if resp.text else []

async def supabase_rpc(func: str, params: dict = None):
    """调用 Supabase 自定义函数"""
    url = f"{SUPABASE_URL}/rest/v1/rpc/{func}"
    async with httpx.AsyncClient() as client:
        resp = await client.post(url, headers=SUPABASE_HEADERS, json=params or {})
        if resp.status_code >= 400:
            raise HTTPException(502, f"RPC error: {resp.text}")
        return resp.json()

# ===== API 接口 =====

@app.get("/")
def root():
    return {"service": "MBTI故事测", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "ok", "time": datetime.now().isoformat()}

# --- 1. 微信登录 ---
@app.post("/api/wx-login")
async def wx_login(req: WxLoginReq):
    """微信 code 换 openid"""
    if not WX_APPID or not WX_MCHID:
        raise HTTPException(500, "微信支付未配置，请先设置 WX_APPID 和 WX_MCHID")
    
    # 调微信接口 code2session
    url = "https://api.weixin.qq.com/sns/jscode2session"
    params = {
        "appid": WX_APPID,
        "secret": WX_KEY,
        "js_code": req.code,
        "grant_type": "authorization_code"
    }
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params)
        data = resp.json()
    
    if "openid" not in data:
        raise HTTPException(400, f"微信登录失败: {data.get('errmsg','')}")
    
    openid = data["openid"]
    
    # 查用户是否存在
    users = await supabase_query("GET", f"users?openid=eq.{openid}&select=id,openid")
    
    if users:
        user = users[0]
        # 更新最后登录
        await supabase_query("PATCH", f"users?id=eq.{user['id']}", {"last_login": "now()"})
    else:
        # 新建用户
        result = await supabase_query("POST", "users", {
            "openid": openid,
            "nick_name": "",
            "avatar_url": "",
            "created_at": datetime.now().isoformat(),
            "last_login": datetime.now().isoformat()
        })
        # Supabase POST 返回数组
        user = result[0] if isinstance(result, list) and result else result
    
    # 生成会话 token
    token = secrets.token_hex(32)
    
    return {
        "id": user["id"],
        "openid": user["openid"],
        "token": token,
        "is_new": not users
    }

# --- 2. 提交答题 ---
@app.post("/api/submit-answers")
async def submit_answers(req: SubmitAnswersReq):
    """提交答案并保存结果"""
    # 校验数据
    if req.mode not in ("quick", "full"):
        raise HTTPException(400, "mode 必须是 quick 或 full")
    if len(req.answers) < 24:
        raise HTTPException(400, "答案数量不足")
    
    result = await supabase_query("POST", "answers", {
        "user_id": 0,  # TODO: 从 token 获取真实 user_id
        "mode": req.mode,
        "answers": json.dumps(req.answers, ensure_ascii=False),
        "result_type": req.result_type,
        "ei": req.ei, "sn": req.sn, "tf": req.tf, "jp": req.jp,
        "ei_score": req.ei_score, "sn_score": req.sn_score,
        "tf_score": req.tf_score, "jp_score": req.jp_score,
        "is_paid": False
    })
    
    rid = result[0]["id"] if isinstance(result, list) else result["id"]
    return {"answer_id": rid, "status": "pending_payment"}

# --- 3. 创建支付订单 ---
@app.post("/api/create-order")
async def create_order(req: CreateOrderReq):
    """创建微信支付订单（0.99元）"""
    out_trade_no = f"MBTI{datetime.now().strftime('%Y%m%d%H%M%S')}{secrets.token_hex(4)}"
    
    order = await supabase_query("POST", "orders", {
        "user_id": 0,  # TODO: 从 token 获取
        "answer_id": req.answer_id,
        "out_trade_no": out_trade_no,
        "amount": 99,  # 0.99元
        "status": "pending"
    })
    
    return {
        "order_id": order[0]["id"] if isinstance(order, list) else order["id"],
        "out_trade_no": out_trade_no,
        "amount": 99,
        "pay_params": {
            # TODO: 对接微信支付统一下单接口后返回 prepay_id
            "appId": WX_APPID,
            "timeStamp": str(int(datetime.now().timestamp())),
            "nonceStr": secrets.token_hex(16),
            "package": "prepay_id=wx1234567890",
            "signType": "MD5"
        }
    }

# --- 4. 支付回调（微信服务器通知）---
@app.post("/api/pay-callback")
async def pay_callback():
    """微信支付结果通知"""
    # TODO: 验签 + 更新订单状态 + 解锁结果
    return {"code": "SUCCESS", "message": "OK"}

# --- 5. 获取结果（检查是否已支付）---
@app.get("/api/result/{answer_id}")
async def get_result(answer_id: int):
    """获取测试结果（仅已支付可见完整结果）"""
    results = await supabase_query(
        "GET", f"answers?id=eq.{answer_id}&select=*,orders!inner(status)"
    )
    if not results:
        raise HTTPException(404, "记录不存在")
    
    r = results[0]
    is_paid = r.get("is_paid", False) or any(
        o.get("status") == "paid" for o in r.get("orders", [])
    )
    
    if not is_paid:
        return {
            "locked": True,
            "message": "支付 ¥0.99 后查看完整结果",
            "preview": {
                "type": r["result_type"],
                "dimensions": f"{r['ei']}/{r['sn']}/{r['tf']}/{r['jp']}"
            }
        }
    
    return {
        "locked": False,
        "result": {
            "type": r["result_type"],
            "ei": r["ei"], "sn": r["sn"], "tf": r["tf"], "jp": r["jp"],
            "ei_score": r["ei_score"], "sn_score": r["sn_score"],
            "tf_score": r["tf_score"], "jp_score": r["jp_score"],
            "answers": json.loads(r["answers"]) if isinstance(r["answers"], str) else r["answers"]
        }
    }

# --- 6. 用户历史记录 ---
@app.get("/api/records/{user_id}")
async def get_records(user_id: int):
    """获取用户测试历史"""
    records = await supabase_query(
        "GET", f"answers?user_id=eq.{user_id}&order=created_at.desc&select=id,mode,result_type,is_paid,created_at"
    )
    return {"records": records}
