import { supabase } from "@/integrations/supabase/client";

const promptInstruction = `
🎧 This script must feel like a real-time **equestrian coach** is speaking **live** to the rider — not like a narrator reading a prewritten podcast. Use **first-person coach tone**, real-time prompts, and physical riding instructions. Never summarize. Always coach in the moment.


I need a **fully personalized 30-minute ride-along podcast script** for my equestrian coaching company, **AI Equestrian**, with the tagline:  
**"Riding INtelligence, Redefined."**

The most important is that script must be ride-along so that rider can listen to while riding a horse.

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

⏸️ **Natural Pauses for Rider Timing**:
Include natural pauses in the script where the rider needs time to perform an action.  
After each instruction that requires physical movement, change, or focus shift, insert a **pause marker in square brackets** to simulate the live timing of a real coaching session:

- [pause 2s] – brief transitions or resets  
- [pause 5s] – basic movement execution (e.g. asking for trot, walk)  
- [pause 10s] – longer actions or full patterns (e.g. half-pass or a full circle)

Use these pauses **at the end of sentences**, never in the middle.  
Do **not explain the pause** — just insert it directly as part of the coaching rhythm.

💬 Example:  
“Ask Varadero to stretch through the poll and lengthen the stride. [pause 5s]”

This helps the rider follow your instructions live and maintain a realistic tempo during the ride.


Script Requirements:
● Use {rider_name} and {horse_name} throughout for personalization
● Include specific timing cues for exercises during the 30-minute session
● Reference their actual scores and movements
● Provide step-by-step guidance they can follow while riding
● Include motivation based on their progress trend: {score_trend}
● End with "Remember - this is AI Equestrian, where we're 'Riding Intelligence,
Redefined.'"
● Use encouraging but technically accurate language
● Include pauses for transitions between exercises
● Reference their upcoming goals: {upcoming_events}

---

---

🎧 **Purpose**: This podcast is designed to guide {rider_name} through a real-time, on-horse training session using expert-level instruction, encouragement, and personalized insights.

---

🎙️ **Podcast Tone**:
- Start warm and enthusiastic
- Be instructional yet conversational in the middle
- Use gentle corrections and encouragement throughout
- End with motivation and next steps
- Use phrasing like: “That’s something to be proud of,” “We’re building on a solid foundation,” “You and {horse_name} have come a long way.”


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

In each section, if section title contains 'opening', 'welcome' or 'thrilled', you should insert [style:energetic] in front of content.
So make sure all content format is [style:energetic]<content>[pause _s]
if section title contains "training focus", "instruction" or "let's start", insert [style:instructional].
if section title contains "correction", "cue", "focus" or "encouraging", insert [style:coaching].
if section title contains "metal game", "confidence", "visualize" or "belief", insert [style:motivational].
if section title contains "wrap-up", "summary", "excellent work" or "remember", insert [style:inspirational].
otherwise insert [style:instructional]
Just return the **full ride-along podcast script only**, with style and pause duration.
[style] and [pause] should be matched so that all contents are inside of them.

---
`

const promptPart1 = `

Generate the first half of a 30-minute equestrian ride-along podcast script. 

Include ONLY the following sections from the structure:
1. Opening (~1200–1400 words)
2. Performance Review (~2280–2480 words)
3. Training Focus 1 (~2280–2480 words)

Use the structure, tone, and personalization data provided below. 
End this part of the script **mid-session**, just after completing Training Focus 1, with a natural riding transition like:

"Take a breath and give {horse_name} a pat. We're going to shift gears now and move into our next focus..."

Do **not** add conclusions or summaries — this is not the end of the ride.

[Insert the full instructions and personalization data here]

🕒 **SCRIPT STRUCTURE AND DURATION (MUST MATCH TIMING)**:
Please write a full script aligned to these exact durations:

1. **Opening (~ 500 words)**  
    Start with a **friendly greeting** using the rider's name.  
    Congratulate them warmly on their recent test score ({overall_score}%).  
    Clearly **state the goal of today's session**, based on their analysis:  
    - Focus 1: {primary_recommendation}  
    - Focus 2: {secondary_recommendation}  
    Include a short comment on the **weather/season** ({current_season}) or an upcoming event ({upcoming_events}) to ground the session in context.  
    End this section by **inviting the rider to begin the session**, encouraging them to settle into the saddle and connect with their horse.
    Use a **conversational, warm coaching tone** — as if you're an expert trainer riding beside them, motivating them gently.
    After the introduction, transition smoothly into a walk and warm-up instructions using their horse’s name ({horse_name}).
   - Personal welcome to {rider_name}  
   - Overview of today's session  
   - Intention setting based on {goals} and {upcoming_events}
   - Speak exactly like a real coach would while riding alongside — present-tense, direct coaching, with warm authority  
   - Use physical cues: “take a deep breath”, “let your reins stretch”, “move into shoulder-in now”
   - Avoid narrator phrases like “today we will work on…” — instead say “Alright, let’s warm up with...”
   - 🗣️ Use coaching tone: calm, direct, grounded. Avoid overly dramatic exclamations. Speak like a seasoned instructor guiding the ride.


2. **Performance Review (~ 1800 words)**  
   - Celebrate {strength_1}, {strength_2}, and {strength_3}  
   - Analyze {overall_score} and movement scores  
   - Discuss {score_trend}  
   - Reflect on {judge_comment_a}, {judge_comment_b}, and {judge_comment_c}
   - Use a **warm, coaching tone** — speak as a supportive instructor guiding {rider_name} through insight and encouragement.  
   - Begin by acknowledging {rider_name} and {horse_name}’s biggest wins from the test. Use warm, encouraging phrases like ‘Let’s start with what went well’ or ‘You’ve earned some praise here…  
   - Specifically highlight {best_movement} and the {best_score}, explaining what this shows about {horse_name} and {rider_name}'s development.  
   - Address the lower score on {worst_movement} ({worst_score}) gently and constructively: frame this as *an opportunity for improvement*, not a failure.  
   - Reflect on {judge_comment_a}, {judge_comment_b}, and {judge_comment_c} in an emotionally intelligent way — emphasize *what the judge wants to see* and *how close the rider already is*.  
   - Speak conversationally, as if coaching {rider_name} while riding:  
   - Use cues like “Let’s take a moment,” “Feel that engagement,” “Notice how {horse_name} responds…”  
   - Include brief physical riding prompts: “Soften your hands,” “Half-halt and breathe,” “Pat {horse_name} when they soften.”  
   - Always tie observations to {score_trend} and {upcoming_events}.  
   - End the section by **reinforcing the rider's growth** and confidence heading into the next training segment.  
   - 🗣️ Use coaching tone: calm, direct, grounded. Avoid overly dramatic exclamations. Speak like a seasoned instructor guiding the ride.

3. **Training Focus 1: {primary_recommendation} (~ 1800 words)**  
   - Quick Fix: {quick_fix_1}  
   - Real-time riding instructions for {exercise_1}  
   - Emphasize {key_points_1}  
   - Goal: {goal_1}  
   - Include time cues (e.g., “for the next 2 minutes, we’ll...”)  
   - Use name: “Okay {rider_name}, now ask {horse_name} to...”

  
   ***********
    🗣️ SCRIPT STYLE REQUIREMENT FOR TRAINING FOCUS:
    - Use a **natural, calm, instructional tone** — similar to a real-life equestrian coach guiding a rider through movements
    - Avoid robotic repetition (don’t repeat the rider's name too often)
    - Use **structured flow**, e.g.:
      - 2 minutes of walk/stretching
      - 2 minutes of shoulder-in to half-pass transitions
      - 1 minute of visualization or reset
    - Include **realistic time cues**: “Spend about 2 minutes here…”
    - Give **step-by-step practical instructions**, as if the rider is actively moving while listening
    - Use coaching language like:
      - “Feel how…”  
      - “Notice when…”  
      - “Let’s go back to that movement now…”  
      - “That’s okay, reset and try again…”  
    - Avoid exaggerated praise. Instead, give constructive, professional feedback:  
      - “Good correction.”  
      - “Now that’s what we’re looking for.”  
      - “This time, let’s refine it a little more.”
   **********
   📌 **ADDITIONAL REQUIREMENTS**:
- The voice must sound like a seasoned equestrian coach, not a podcast narrator or AI assistant
- Do not include explanation-style or summary phrases. Always speak in active coaching style.
- Script should sound natural and flowing for a voiceover or AI narrator
- Include transitions and rider-focused motivational language
- Use {rider_name} and {horse_name} frequently
- Keep language professional, instructional, and emotionally supportive

---

🚫 DO NOT summarize or introduce the script. Just return the **full ride-along podcast script only**, with style and pause duration.
[style] and [pause] should be matched so that all contents are inside of them.
`

  const promptPart2 = `

  Continue the 30-minute equestrian ride-along podcast script. 

Start naturally by picking up from the last section, as if the coach and rider are still mid-ride.

Include ONLY the following sections:
4. Training Focus 2 (~1800 words)
5. Mental Game (~420 words)
6. Wrap-Up (~200 words)

Pick up with a natural transition like:
"Okay {rider_name}, now let’s refocus and get into our second key area: {secondary_recommendation}..."

Maintain the same coaching tone, language style, and pacing. End with the final line:
**“Remember – this is AI Equestrian, where we're 'Riding INtelligence, Redefined.’”**

Do not repeat the opening or prior instructions. Just continue smoothly as a second half.

[Insert the same personalization data and structure below]
   

4. **Training Focus 2: {secondary_recommendation} (~ 1800 words)**  
   - Quick Fix: {quick_fix_2}  
   - Real-time guided practice for {exercise_2}  
   - Focus on {key_points_2}  
   - Goal: {goal_2}  
   - Include transitional language and corrections  
   - Reinforce improvement from Focus 1 to Focus 2

   ***********
    🗣️ SCRIPT STYLE REQUIREMENT FOR TRAINING FOCUS:
    - Use a **natural, calm, instructional tone** — similar to a real-life equestrian coach guiding a rider through movements
    - Avoid robotic repetition (don’t repeat the rider's name too often)
    - Use **structured flow**, e.g.:
      - 2 minutes of walk/stretching
      - 2 minutes of shoulder-in to half-pass transitions
      - 1 minute of visualization or reset
    - Include **realistic time cues**: “Spend about 2 minutes here…”
    - Give **step-by-step practical instructions**, as if the rider is actively moving while listening
    - Use coaching language like:
      - “Feel how…”  
      - “Notice when…”  
      - “Let’s go back to that movement now…”  
      - “That’s okay, reset and try again…”  
    - Avoid exaggerated praise. Instead, give constructive, professional feedback:  
      - “Good correction.”  
      - “Now that’s what we’re looking for.”  
      - “This time, let’s refine it a little more.”
   **********

5. **Mental Game (~ 420 words)**  
   - Visualization exercise based on {goals}  
   - Positive reinforcement of current progress  
   - Re-center confidence with gentle focus cues
   - 🗣️ Use coaching tone: calm, direct, grounded. Avoid overly dramatic exclamations. Speak like a seasoned instructor guiding the ride.

6. **Wrap-Up (~ 200 words)**  
   - Summary of today's work  
   - Encourage progress before {upcoming_events}  
   - Preview next ride’s focus  
   - End with the tagline:  
     **“Remember – this is AI Equestrian, where we're 'Riding INtelligence, Redefined.'”**
   - 🗣️ Use coaching tone: calm, direct, grounded. Avoid overly dramatic exclamations. Speak like a seasoned instructor guiding the ride.

---

📌 **ADDITIONAL REQUIREMENTS**:
- The voice must sound like a seasoned equestrian coach, not a podcast narrator or AI assistant
- Do not include explanation-style or summary phrases. Always speak in active coaching style.
- Script should sound natural and flowing for a voiceover or AI narrator
- Include transitions and rider-focused motivational language
- Use {rider_name} and {horse_name} frequently
- Keep language professional, instructional, and emotionally supportive

---

🚫 DO NOT summarize or introduce the script. Just return the **full ride-along podcast script only**, with style and pause duration.
[style] and [pause] should be matched so that all contents are inside of them.
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

export function fill_Template_Make_Prompts(data) {
  const fillPlaceholders = (template) =>
    template.replace(/\{(.*?)\}/g, (_, key) =>
      data[key] !== undefined ? data[key] : `{${key}}`
    );

  const fullPrompt1 = fillPlaceholders(promptInstruction + promptPart1);
  const fullPrompt2 = fillPlaceholders(promptInstruction + promptPart2);

  return [fullPrompt1, fullPrompt2];
}

export function formatScriptWithStyles(script: string): string {
  // Step 1: Remove triple backticks and **bold** and (...) text
  return script
    .replace(/```(?:text)?/g, '') // Remove ``` markers
    .replace(/\*\*[^*]+\*\*/g, '') // Remove **...**
    .replace(/\([^)]+\)/g, '') // Remove (...) text
    .replace(/\n{3,}/g, '\n\n') // Collapse multiple newlines
    .replace(/\[pause \d+s\]\s*$/i, '') // Remove final [pause Xs] at end
    .trim();
}