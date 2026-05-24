// MBTI 故事测 — 创建微信支付订单
// 部署：supabase functions deploy create-order

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  try {
    const { answer_id, user_id } = await req.json()
    if (!answer_id) throw new Error("缺少 answer_id")

    // 生成商户订单号
    const ts = Date.now().toString(36).toUpperCase()
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
    const outTradeNo = `MBTI${ts}${rand}`

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    // 创建订单
    const { data: order, error } = await supabase.from("orders").insert({
      user_id,
      answer_id,
      out_trade_no: outTradeNo,
      amount: 99,  // 0.99元
      status: "pending",
    }).select("id").single()

    if (error) throw error

    // 返回小程序支付所需参数
    // 实际需对接微信支付统一下单接口获得 prepay_id
    const timeStamp = Math.floor(Date.now() / 1000).toString()
    const nonceStr = Math.random().toString(36).substring(2, 18)

    return new Response(JSON.stringify({
      order_id: order.id,
      out_trade_no: outTradeNo,
      amount: 99,
      pay_params: {
        appId: Deno.env.get("WX_APPID") || "",
        timeStamp,
        nonceStr,
        package: "prepay_id=wx",  // TODO: 替换为真实 prepay_id
        signType: "MD5",
      }
    }), { headers: { "Content-Type": "application/json" } })

  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 })
  }
})
