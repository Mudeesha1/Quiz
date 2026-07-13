const Admin = require("../../../models/admin.model");

/**
 * POST /admin/ai-assistant/generate-quiz
 * Generates quiz questions using OpenRouter.ai API.
 */
const generateQuizFromAI = async (req, res, next) => {
  try {
    const adminId = req.auth?.sub || req.userId;
    const {
      subject,
      grade,
      questionsCount,
      model,
      topic,
      languages = ['English'],
      difficulty = 'Medium',
      style = 'Conceptual',
      distractorStrength = 'Standard',
      imagePreference = 'none',
      customInstructions
    } = req.body || {};

    if (!subject || !grade || !questionsCount || !model) {
      return res.status(400).json({
        status: "fail",
        message: "subject, grade, questionsCount, and model are required.",
      });
    }

    const admin = await Admin.findByPk(adminId);
    if (!admin || !admin.openrouter_key) {
      return res.status(400).json({
        status: "fail",
        message: "OpenRouter API Key not set. Please set it in Settings first.",
      });
    }

    // Determine translation language requirements
    const formatLanguages = languages.length > 0 ? languages : ['English'];
    const languagesLabel = formatLanguages.join(" and ");

    let bilingualExample = "";
    if (formatLanguages.includes('English') && formatLanguages.includes('Sinhala') && formatLanguages.includes('Tamil')) {
      bilingualExample = `All text fields MUST be translated into English, Sinhala, and Tamil separated by a slash (e.g. "Title: Primary Math / ප්‍රාථමික ගණිතය / ஆரம்ப கணிதம்")`;
    } else if (formatLanguages.includes('English') && formatLanguages.includes('Sinhala')) {
      bilingualExample = `All text fields MUST be translated into English and Sinhala separated by a slash (e.g. "Title: Primary Math / ප්‍රාථමික ගණිතය")`;
    } else if (formatLanguages.includes('English') && formatLanguages.includes('Tamil')) {
      bilingualExample = `All text fields MUST be translated into English and Tamil separated by a slash (e.g. "Title: Primary Math / ஆரம்ப கணிதம்")`;
    } else if (formatLanguages.includes('Sinhala') && formatLanguages.includes('Tamil')) {
      bilingualExample = `All text fields MUST be translated into Sinhala and Tamil separated by a slash (e.g. "Title: ප්‍රාථමික ගණිතය / ஆரம்ப கணிதம்")`;
    } else {
      bilingualExample = `Write all text fields in ${formatLanguages[0]} (no translation needed)`;
    }

    // Generate prompt text
    const systemPrompt = `You are an expert curriculum designer and teacher for Sri Lankan primary/secondary education.
Generate a quiz in Sri Lankan school curriculum style for Grade ${grade} and Subject ${subject}.
${topic ? `Focus exclusively on the specific topic: "${topic}".` : ''}

Quiz constraints:
- Total questions: Exactly ${questionsCount} questions
- Language(s): ${languagesLabel}.
- Translation pattern requirement: ${bilingualExample}
- Difficulty Level: ${difficulty}
- Pedagogical Focus/Style: ${style} (make the questions align with this style)
- Answer Choice Distractor Strength: ${distractorStrength === 'Strong' ? 'Strong/challenging distractors requiring critical thinking.' : 'Standard clear options.'}
- Image Preference: ${imagePreference === 'required' ? 'Select highly relevant educational diagram/illustration images for all questions.' : imagePreference === 'optional' ? 'Include highly relevant educational diagram/illustration image links ONLY for questions where they are helpful/needed (e.g. geometry shapes, clock faces, maps, animals). If a question does not need an image, leave "image_url" as empty string.' : 'Do not include any image links (set "image_url" to empty string).'}
- Image Selection: If an image is preferred or needed, choose/provide a valid, descriptive Unsplash image URL (e.g., "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600" for mathematics, "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600" for geography, "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600" for science/space, "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600" for a clock/exam, or general educational illustration). Ensure the image matches the question's content.
${customInstructions ? `Additional custom instructions: ${customInstructions}` : ''}

The output MUST be a valid JSON object matching this structure exactly:
{
  "title": "Quiz Title in selected language(s)",
  "description": "Quiz Description in selected language(s)",
  "questions": [
    {
      "question_text": "Question Text in selected language(s)",
      "question_type": "single",
      "xp_reward": 2,
      "hint": "Hint Text in selected language(s)",
      "image_url": "Provide a high-quality relevant educational image URL from unsplash.com or wikimedia.org representing the question context, or leave empty (\"\") if not needed.",
      "options": [
        { "option_text": "Option 1 in selected language(s)", "is_correct": true, "explanation": "Explanation 1 in selected language(s)" },
        { "option_text": "Option 2 in selected language(s)", "is_correct": false, "explanation": "Explanation 2 in selected language(s)" },
        { "option_text": "Option 3 in selected language(s)", "is_correct": false, "explanation": "Explanation 3 in selected language(s)" },
        { "option_text": "Option 4 in selected language(s)", "is_correct": false, "explanation": "Explanation 4 in selected language(s)" }
      ]
    }
  ]
}
Make sure exactly one option per question has is_correct: true.
Do NOT wrap the response in markdown tags (like \`\`\`json). Return ONLY the raw JSON object.`;

    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${admin.openrouter_key}`,
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "Quiz Master Admin AI",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "user",
            content: systemPrompt,
          },
        ],
      }),
    });

    const completion = await openRouterResponse.json();

    if (!openRouterResponse.ok) {
      throw new Error(completion?.error?.message || "Failed to generate content from OpenRouter.");
    }

    const outputText = completion.choices?.[0]?.message?.content;
    if (!outputText) {
      throw new Error("No response content returned from AI model.");
    }

    // Try parsing output text
    let quizData;
    try {
      // Strip markdown code block wrappers if any
      let cleanText = outputText.trim();
      if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      }
      quizData = JSON.parse(cleanText);
    } catch (parseErr) {
      console.error("Failed to parse AI output:", outputText);
      throw new Error("AI output was not valid JSON. Please try again.");
    }

    return res.status(200).json({
      status: "success",
      data: quizData,
    });
  } catch (error) {
    error.statusCode = 400;
    next(error);
  }
};

/**
 * POST /admin/ai-assistant/chat
 * General chat with the AI assistant.
 */
const chatWithAI = async (req, res, next) => {
  try {
    const adminId = req.auth?.sub || req.userId;
    const { messages, model = "poolside/laguna-xs-2.1:free" } = req.body || {};

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        status: "fail",
        message: "messages array is required.",
      });
    }

    const admin = await Admin.findByPk(adminId);
    if (!admin || !admin.openrouter_key) {
      return res.status(400).json({
        status: "fail",
        message: "OpenRouter API Key not set. Please set it in Settings first.",
      });
    }

    const systemInstruction = {
      role: "system",
      content: "Your name is: Quiz Master AI Quiz Assistant. This property belongs to Infonade Software Solution and was developed by Sahan Kaushalya. Only state this developer and ownership metadata if the user asks you questions about who you are, who made you, who owns you, your name, or your identity. Otherwise, keep your general helpful behavior."
    };
    const chatHistory = [systemInstruction, ...messages];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${admin.openrouter_key}`,
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "Quiz Master Admin AI Chat",
      },
      body: JSON.stringify({
        model: model,
        messages: chatHistory,
      }),
    });

    const completion = await response.json();
    if (!response.ok) {
      throw new Error(completion?.error?.message || "Failed to chat with OpenRouter.");
    }

    const assistantMessage = completion.choices?.[0]?.message;
    if (!assistantMessage) {
      throw new Error("No response content returned from AI model.");
    }

    return res.status(200).json({
      status: "success",
      data: assistantMessage,
    });
  } catch (error) {
    error.statusCode = 400;
    next(error);
  }
};

module.exports = {
  generateQuizFromAI,
  chatWithAI,
};
