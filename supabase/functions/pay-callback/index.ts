// MBTI 故事测 — 微信支付回调通知
// 微信支付成功后，微信服务器会回调此接口
// 部署：supabase functions deploy pay-callback

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  try {
    const body = await req.text()
    // TODO: 微信支付回调验签
    // 参考: https://pay.weixin.qq.com/wiki/doc/apiv3/wechatpay/wechatpay4_1.shtml

    // 解析回调数据（简化版）
    const { out_trade_no, transaction_id, result_code } = JSON.parse(body)

    if (result_code !== "SUCCESS") {
      return new Response("<xml><return_code><![CDATA[FAIL]]></return_code></xml>", {
        headers: { "Content-Type": "application/xml" }
      })
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    // 更新订单状态
    const { data: order } = await supabase.from("orders")
      .update({ status: "paid", transaction_id, paid_at: new Date().toISOString() })
      .eq("out_trade_no", out_trade_no)
      .select("answer_id")
      .single()

    if (order) {
      // 解锁结果
      await supabase.from("answers")
        .update({ is_paid: true })
        .eq("id", order.answer_id)

      // 记录解锁
      await supabase.from("unlocks").insert({
        user_id: 0,  // TODO: 从订单查 user_id
        answer_id: order.answer_id,
        order_id: 0,
      })
    }

    return new Response("<xml><return_code><![CDATA[SUCCESS]]></return_code></xml>", {
      headers: { "Content-Type": "application/xml" }
    })

  } catch (err) {
    console.error("回调处理失败:", err)
    return new Response("<xml><return_code><![CDATA[FAIL]]></return_code></xml>", {
      headers: { "Content-Type": "application/xml" }
    })
  }
})
