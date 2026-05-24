// MBTI 故事测 — 提交答案 + 计算结果
// 部署：supabase functions deploy submit-answers

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const TYPE_NAMES: Record<string, string> = {
  "INTJ": "建筑师", "INTP": "逻辑学家", "ENTJ": "指挥官", "ENTP": "辩论家",
  "INFJ": "提倡者", "INFP": "调停者", "ENFJ": "主人公", "ENFP": "竞选者",
  "ISTJ": "物流师", "ISFJ": "守卫者", "ESTJ": "总经理", "ESFJ": "执政官",
  "ISTP": "鉴赏家", "ISFP": "探险家", "ESTP": "企业家", "ESFP": "表演者"
}

function calcResult(answers: string[], mode: string) {
  // 快速版取前6题/维度；完整版全算
  const dimLen = mode === "quick" ? 6 : 21
  const groups = [
    answers.slice(0, dimLen),                    // E/I
    answers.slice(dimLen, dimLen * 2),           // S/N
    answers.slice(dimLen * 2, dimLen * 3),       // T/F
    answers.slice(dimLen * 3, dimLen * 4),       // J/P
  ]
  const threshold = Math.ceil(groups[0].length / 2)
  
  const dims = [
    { key: "E", count: groups[0].filter(x => x === "a").length, total: groups[0].length },
    { key: "S", count: groups[1].filter(x => x === "a").length, total: groups[1].length },
    { key: "T", count: groups[2].filter(x => x === "a").length, total: groups[2].length },
    { key: "J", count: groups[3].filter(x => x === "a").length, total: groups[3].length },
  ]
  
  const results = dims.map(d => ({
    letter: d.count >= threshold ? d.key : (d.key === "E" ? "I" : d.key === "S" ? "N" : d.key === "T" ? "F" : "P"),
    score: d.count >= threshold ? d.count : d.total - d.count,
    total: d.total,
  }))
  
  const type = results.map(r => r.letter).join("")
  return { type, results, name: TYPE_NAMES[type] || "" }
}

serve(async (req) => {
  try {
    const { mode, answers, user_id } = await req.json()
    if (!["quick", "full"].includes(mode)) throw new Error("mode 无效")
    if (!Array.isArray(answers) || answers.length < 24) throw new Error("答案不足")

    const { type, results, name } = calcResult(answers, mode)

    // 保存到 Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )
    
    const { data, error } = await supabase.from("answers").insert({
      user_id,
      mode,
      answers,
      result_type: type,
      ei: results[0].letter, sn: results[1].letter,
      tf: results[2].letter, jp: results[3].letter,
      ei_score: results[0].score, sn_score: results[1].score,
      tf_score: results[2].score, jp_score: results[3].score,
      is_paid: false,
    }).select("id").single()

    if (error) throw error

    return new Response(JSON.stringify({
      answer_id: data.id,
      type,
      name,
      dimensions: results.map(r => `${r.letter} ${r.score}/${r.total}`),
      status: "pending_payment"
    }), { headers: { "Content-Type": "application/json" } })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
