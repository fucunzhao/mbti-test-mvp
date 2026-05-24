// MBTI 故事测 — Supabase Edge Function
// 微信登录：code 换 openid
// 部署：supabase functions deploy wx-login

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const WX_APPID = Deno.env.get("WX_APPID") || ""
const WX_SECRET = Deno.env.get("WX_SECRET") || ""

serve(async (req) => {
  try {
    const { code } = await req.json()
    if (!code) {
      return new Response(JSON.stringify({ error: "缺少 code" }), { status: 400 })
    }

    // 调微信接口 code2session
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${WX_APPID}&secret=${WX_SECRET}&js_code=${code}&grant_type=authorization_code`
    const wxResp = await fetch(url)
    const wxData = await wxResp.json()

    if (wxData.errcode) {
      return new Response(JSON.stringify({ error: wxData.errmsg }), { status: 400 })
    }

    const openid = wxData.openid

    // 查询或创建用户
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || ""
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || ""
    const headers = { "apikey": supabaseKey, "Authorization": `Bearer ${supabaseKey}` }

    // 查用户
    const getResp = await fetch(
      `${supabaseUrl}/rest/v1/users?openid=eq.${openid}&select=*`,
      { headers }
    )
    const users = await getResp.json()
    let user = users?.[0]

    if (!user) {
      // 新建
      const postResp = await fetch(`${supabaseUrl}/rest/v1/users`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ openid, nick_name: "", avatar_url: "" })
      })
      const newUsers = await postResp.json()
      user = Array.isArray(newUsers) ? newUsers[0] : newUsers
    } else {
      // 更新最后登录
      await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${user.id}`, {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ last_login: new Date().toISOString() })
      })
    }

    return new Response(JSON.stringify({
      id: user.id,
      openid: user.openid,
      is_new: !users?.[0]
    }), { headers: { "Content-Type": "application/json" } })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
