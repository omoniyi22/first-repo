import { supabase } from "@/integrations/supabase/client";

const promptTemplate = `
You are an expert equestrian podcast scriptwriter. I need a **fully personalized 30-minute ride-along podcast script** for my equestrian coaching company, **AI Equestrian**, with the tagline:  
**"Riding INtelligence, Redefined."**

---
Session Context:
Create a 30-minute personalized ride-along podcast script for {rider_name} and {horse_name} based on their latest {discipline} analysis.

Session Context:
{rider_name} is a {experience_level} {discipline} rider working with {horse_name}, a {horse_age}-year-old {horse_breed}. Their recent test scored {overall_score}%, with their strongest performance in {best_movement} ({best_score}) and room for improvement in {worst_movement} ({worst_score}).

Key Focus Areas:
1. Primary: {primary_recommendation}
   ○ Quick Fix: {quick_fix_1}
   ○ Exercise: {exercise_1}
   ○ Goal: {goal_1}

2. Secondary: {secondary_recommendation}
   ○ Quick Fix: {quick_fix_2}
   ○ Exercise: {exercise_2}
   ○ Goal: {goal_2}

Strengths to Celebrate:
- {strength_1}
- {strength_2}

Judge Feedback to Address:
- {judge_comment_a}
- {judge_comment_b}

---

---

🎧 **Purpose**: This podcast is designed to guide {rider_name} through a real-time, on-horse training session using expert-level instruction, encouragement, and personalized insights.

---

🎙️ **Podcast Tone**:
- Start warm and enthusiastic
- Be instructional yet conversational in the middle
- Use gentle corrections and encouragement throughout
- End with motivation and next steps

---

🧠 **Personalization Data** (USE ALL DATA BELOW FOR SPECIFICITY):

Rider Information:
- Name: {rider_name}
- Discipline: {discipline}
- Experience Level: {experience_level}
- Recent Competition Goals: {goals}

Horse Information:
- Name: {horse_name}
- Age: {horse_age}
- Breed: {horse_breed}
- Training Level: {horse_level}

Analysis Results:
- Overall Score: {overall_score}%
- Highest Scoring Movement: {best_movement} – {best_score}
- Lowest Scoring Movement: {worst_movement} – {worst_score}
- Trend Analysis: {score_trend}

Strengths:
- {strength_1}
- {strength_2}
- {strength_3}

Areas for Improvement:
- {weakness_1}
- {weakness_2}
- {weakness_3}

Judge Comments:
- Comment A: {judge_comment_a}
- Comment B: {judge_comment_b}
- Comment C: {judge_comment_c}

Specific Recommendations:
- **Primary Focus**: {primary_recommendation}
  - Quick Fix: {quick_fix_1}
  - Exercise: {exercise_1}
  - Key Points: {key_points_1}
  - Goal: {goal_1}
- **Secondary Focus**: {secondary_recommendation}
  - Quick Fix: {quick_fix_2}
  - Exercise: {exercise_2}
  - Key Points: {key_points_2}
  - Goal: {goal_2}

Environmental Context:
- Season: {current_season}
- Upcoming Competitions: {upcoming_events}
- Training Phase: {training_phase}

---

🕒 **SCRIPT STRUCTURE AND DURATION (MUST MATCH TIMING)**:
Please write a full script aligned to these exact durations, using approximately **130–140 words per minute** for speech:

1. **Opening (3 minutes / ~ 780 - 840 words)**  
   - Personal welcome to {rider_name}  
   - Overview of today's session  
   - Intention setting based on {goals} and {upcoming_events}

2. **Performance Review (8 minutes / ~ 2080 - 2280 words)**  
   - Celebrate {strength_1}, {strength_2}, and {strength_3}  
   - Analyze {overall_score} and movement scores  
   - Discuss {score_trend}  
   - Reflect on {judge_comment_a}, {judge_comment_b}, and {judge_comment_c}

3. **Training Focus 1: {primary_recommendation} (8 minutes /  ~ 2080 - 2280 words)**  
   - Quick Fix: {quick_fix_1}  
   - Real-time riding instructions for {exercise_1}  
   - Emphasize {key_points_1}  
   - Goal: {goal_1}  
   - Include time cues (e.g., “for the next 2 minutes, we’ll...”)  
   - Use name: “Okay {rider_name}, now ask {horse_name} to...”

4. **Training Focus 2: {secondary_recommendation} (8 minutes /  ~ 2080 - 2280 words)**  
   - Quick Fix: {quick_fix_2}  
   - Real-time guided practice for {exercise_2}  
   - Focus on {key_points_2}  
   - Goal: {goal_2}  
   - Include transitional language and corrections  
   - Reinforce improvement from Focus 1 to Focus 2

5. **Mental Game (2 minutes / ~ 520 - 560 words)**  
   - Visualization exercise based on {goals}  
   - Positive reinforcement of current progress  
   - Re-center confidence with gentle focus cues

6. **Wrap-Up (1 minute / ~ 260 - 280 words)**  
   - Summary of today's work  
   - Encourage progress before {upcoming_events}  
   - Preview next ride’s focus  
   - End with the tagline:  
     **“Remember – this is AI Equestrian, where we're 'Riding INtelligence, Redefined.'”**

---

📌 **ADDITIONAL REQUIREMENTS**:
- DO NOT include music cues or TTS formatting
- Script should sound natural and flowing for a voiceover or AI narrator
- Include transitions and rider-focused motivational language
- Use {rider_name} and {horse_name} frequently
- Keep language professional, instructional, and emotionally supportive
- Include time cues in training sections (e.g., “next 90 seconds,” “pause and reset”)

---

🚫 DO NOT summarize or introduce the script. Just return the **full ride-along podcast script only**, with full word count per section to match 30 minutes of voice time.

`;


export async function callPodcastScript(prompt) {
  try {
    const { data, error } = await supabase.functions.invoke('podcast-script', {
      body: { prompt },
    });

    if (error) {
      console.error('❌ Error from Supabase function:', error);
      return null;
    }

    console.log('✅ Function response:', data.result);
    return data;

  } catch (err) {
    console.error('❌ Invocation failed:', err);
  }
}

export function fillTemplate(data) {
  return promptTemplate.replace(/\{(.*?)\}/g, (_, key) => {
    return data[key] !== undefined ? data[key] : `{${key}}`;
  });
}

export function formatScriptWithStyles(script: string, pauseTime: number): string {
  const pauseTag = `[pause ${pauseTime}s]`;

  // Helper to pick style based on section keywords
  function pickStyle(text: string): string {
    const lower = text.toLowerCase();

    if (lower.includes('opening') || lower.includes('welcome') || lower.includes('thrilled')) {
      return 'energetic';
    }
    if (lower.includes('training focus') || lower.includes('instruction') || lower.includes("let's start")) {
      return 'instructional';
    }
    if (lower.includes('correction') || lower.includes('cue') || lower.includes('focus') || lower.includes('encouraging')) {
      return 'coaching';
    }
    if (lower.includes('mental game') || lower.includes('confidence') || lower.includes('visualize') || lower.includes('belief')) {
      return 'motivational';
    }
    if (lower.includes('wrap-up') || lower.includes('summary') || lower.includes('excellent work') || lower.includes('remember')) {
      return 'inspirational';
    }
    return 'instructional';
  }

  // Step 1: Remove triple backticks and **bold** and (...) text
  let cleaned = script
    .replace(/```/g, '') // Remove ``` markers
    .replace(/\*\*[^*]+\*\*/g, '') // Remove **...**
    .replace(/\([^)]+\)/g, '') // Remove (...) text
    .replace(/\n{3,}/g, '\n\n') // Collapse multiple newlines
    .trim();

  // Step 2: Break by section headings manually (they're still visible in cleaned text)
  const sectionRegex = /(?:^|\n\n)([A-Z][^\n]+)\n\n/g;
  const sections: string[] = [];
  let lastIndex = 0;
  let match;

  // Find all sections by heading (e.g. Opening, Performance Review...)
  while ((match = sectionRegex.exec(cleaned)) !== null) {
    const sectionStart = match.index;
    if (sectionStart > lastIndex) {
      const prevSection = cleaned.slice(lastIndex, sectionStart).trim();
      if (prevSection) sections.push(prevSection);
    }
    lastIndex = sectionStart;
  }

  // Add the last section
  const finalSection = cleaned.slice(lastIndex).trim();
  if (finalSection) sections.push(finalSection);

  // Step 3: Format each section with [style] and [pause]
  const formattedSections = sections.map(section => {
    const style = pickStyle(section);
    return `[style:${style}]\n${section.trim()}\n${pauseTag}`;
  });

  // Join all sections with double line break
  return formattedSections.join('\n\n');
}