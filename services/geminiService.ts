import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { UploadedImage } from "../types";

/**
 * --- MINH BẠCH VỀ MÃ NGUỒN (SOURCE CODE TRANSPARENCY) ---
 * RULEBOOK: Quy tắc tạo Prompt chuẩn Editorial Fashion.
 * Nội dung này được đưa trực tiếp vào System Instruction của AI.
 */
const SYSTEM_INSTRUCTION_RULEBOOK = `
1. GENERAL STYLE – PHONG CÁCH CHUNG
Prompt luôn viết bằng tiếng Anh, trừ khi bạn yêu cầu tiếng Việt.
Tone: clean, elegant, detailed, fashion-editorial, giống phong mô tả của Freepik.
Không dùng: ngôn ngữ thô tục, quá gợi dục, không “explicit”. Sexy = sexy thời trang, editorial.
Luôn cố gắng mô tả: Model (giới tính, tuổi, da, mặt, tóc), Outfit (loại đồ, chất liệu, màu, độ ôm), Pose (dáng đứng/ngồi, chân, tay), Camera angle & framing, Background, Lighting, Mood / overall style.

2. FEMALE CORE – NHÂN VẬT NỮ MẶC ĐỊNH
Mặc định (trừ khi user nói khác):
Main character: a slender Vietnamese woman
Age: around 21–25 years old
Skin tone: fair skin / very fair skin / porcelain fair skin
Face: baby-faced look, doll-like appearance, youthful features
Eyes & vibe: often big, bright eyes, soft, gentle, cute, or elegant look
Makeup mặc định (baby-face makeup): rosy blush on her cheeks, glossy pink or nude lips, soft or delicate eyeliner, có thể thêm: long lashes, subtle highlight.

3. MALE CORE – NHÂN VẬT NAM MẶC ĐỊNH
Khi user yêu cầu nhân vật nam (hoặc ghi rõ “man/boy/male”):
Main character: a slender Vietnamese man
Age: around 18–22 years old
Skin tone: light warm beige skin hoặc light tan Vietnamese skin
Face & features: a soft yet defined jawline, harmonious, masculine features, almond-shaped dark brown eyes, straight dark eyebrows
Hair: short dark brown textured hair styled slightly upward with a subtle side part
Skin / makeup: natural, makeup-free complexion with subtle skin texture, clean-shaven or very lightly groomed stubble

4. HAIR – BẮT BUỘC PHẢI CÓ (CẢ NAM & NỮ)
Luôn ghi đủ 3 yếu tố: Length + Color + Style
Length: short / medium / long
Color: black / dark brown / light brown / blonde / ash-brown / etc.
Style: straight / wavy / curly / ponytail / bun / twin-tails / half-up / slicked back / textured / messy fringe

5. OUTFIT – TRANG PHỤC (RẤT QUAN TRỌNG)
Cho cả nam lẫn nữ: luôn mô tả rõ:
5.1. Loại trang phục (Nữ: dress, mini skirt, bodysuit... Nam: hoodie, bomber, suit...)
5.2. Chất liệu (velvet, leather, lace, satin, cotton, denim, nylon...)
5.3. Độ ôm & phom (form-fitting, oversized, cropped...)
5.4. Màu sắc (pastel pink, cream, white, black, deep red...)

6. BACKGROUND & ENVIRONMENT
Mặc định: clean white background / plain white studio backdrop / solid color minimalist background.
Style: minimalist, clean, modern.
Nếu user yêu cầu bối cảnh khác -> update đúng yêu cầu nhưng giữ mood an toàn, fashion.

7. LIGHTING – ÁNH SÁNG
Mặc định dùng ánh sáng studio đẹp: soft and diffused lighting, bright and even lighting, high-key studio lighting.

8. CAMERA ANGLE & FRAMING
Luôn ghi rõ: Framing (full-body / mid shot) và Angle (eye-level / low-angle / high-angle).

9. POSE – TƯ THẾ (CỰC QUAN TRỌNG)
Luôn mô tả: Body position, Legs placement, Hands & interaction.
Sexy pose = sexy fashion / editorial, không mô tả chi tiết body parts theo kiểu thô.

10. FACIAL EXPRESSION & VIBE
Luôn thêm câu về biểu cảm & mood: soft / gentle / shy / confident / playful / dreamy.
Nữ: baby-face vibe, doll-like charm.
Nam: calm and confident, relaxed, youthful charm.

11. PROPS – ĐẠO CỤ
Tập trung đạo cụ an toàn, thời trang, dễ thương.

12. OVERALL MOOD SENTENCE – CÂU KẾT
Luôn kết thúc prompt với 1 câu tổng kết editorial, ví dụ: "The overall style follows modern fashion editorial principles — bold, elegant, and visually balanced."

13. BASE TEMPLATE
Tuân thủ cấu trúc: [Angle & Shot] -> [Character Core] -> [Outfit] -> [Pose & Expression] -> [Lighting & Background] -> [Overall Style].

14. OBEY USER MODIFICATIONS – CÁCH UPDATE KHI USER YÊU CẦU
Khi user có yêu cầu thay đổi (User Notes):
Giữ nguyên cấu trúc prompt & tone editorial.
Chỉ sửa đúng phần được yêu cầu (màu sắc, góc, đồ, giới tính).
Vẫn đảm bảo an toàn, không explicit.
`;

export const generatePromptFromImages = async (
  apiKey: string,
  images: UploadedImage[],
  userNotes: string,
  angle: string,
  backgroundStyle: string,
  gender: string = 'female'
): Promise<string> => {
  
  // 1. Kiểm tra API Key (Validation)
  if (!apiKey || !apiKey.trim().startsWith("AIza")) {
    throw new Error("API Key không hợp lệ. Vui lòng nhập Key chuẩn bắt đầu bằng 'AIza'.");
  }

  // 2. Khởi tạo Gemini với Key của người dùng
  const ai = new GoogleGenAI({ apiKey: apiKey });

  if (images.length === 0) {
    throw new Error("Vui lòng tải lên ít nhất một hình ảnh.");
  }

  // 3. Xử lý logic bối cảnh từ dropdown
  let bgDescription = "a clean white studio background"; 
  if (backgroundStyle === 'gradient') {
    bgDescription = "a soft abstract gradient studio background";
  } else if (backgroundStyle === 'studio') {
    bgDescription = "a professional studio background with subtle props";
  }

  let angleInstruction = angle ? angle : "eye-level"; 

  const parts: any[] = [];

  // 4. Thêm ảnh vào nội dung gửi đi
  images.forEach((img) => {
    parts.push({
      inlineData: {
        mimeType: img.mimeType,
        data: img.base64Data,
      },
    });
  });

  // 5. Xây dựng Prompt gửi cho AI
  // Kết hợp Rulebook + Yêu cầu người dùng
  const textPrompt = `
    Bạn là một chuyên gia Prompt Engineering chuyên về ảnh thời trang phong cách "Freepik/Editorial".

    HÃY TUÂN THỦ NGHIÊM NGẶT "RULEBOOK" DƯỚI ĐÂY KHI VIẾT PROMPT:
    
    --- START RULEBOOK ---
    ${SYSTEM_INSTRUCTION_RULEBOOK}
    --- END RULEBOOK ---

    YÊU CẦU CỤ THỂ TỪ NGƯỜI DÙNG (USER INPUT):
    1. Giới tính mong muốn: ${gender === 'male' ? 'Nam (Male)' : 'Nữ (Female)'}
    2. Ghi chú thêm (User Notes): "${userNotes ? userNotes : "Không có yêu cầu đặc biệt, hãy tự phân tích ảnh gốc."}"
    3. Góc chụp (Camera Angle): "${angleInstruction}"
    4. Bối cảnh (Background): "${bgDescription}"

    NHIỆM VỤ:
    - Phân tích hình ảnh đính kèm.
    - Viết một Text Prompt tiếng Anh hoàn chỉnh dựa trên Rulebook và yêu cầu người dùng.
    - Output format: Chỉ trả về duy nhất đoạn văn bản Prompt tiếng Anh, không thêm lời dẫn.
  `;

  parts.push({ text: textPrompt });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: parts,
      },
      config: {
        temperature: 0.5,
        // Cấu hình an toàn
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        ],
      }
    });

    const text = response.text;
    if (!text) {
      const candidate = response.candidates?.[0];
      if (candidate?.finishReason === 'SAFETY') {
          throw new Error("Nội dung bị chặn bởi bộ lọc an toàn (Safety Filter). Vui lòng thử ảnh khác.");
      }
      throw new Error("Không nhận được phản hồi từ AI.");
    }

    return text.trim();
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Phân loại lỗi để báo cho người dùng biết nếu Key của họ bị sai
    if (error.message && (error.message.includes("403") || error.message.includes("API key") || error.message.includes("API_KEY_INVALID"))) {
        throw new Error("XÁC THỰC THẤT BẠI: API Key bạn nhập không chính xác hoặc không có quyền truy cập model này. Vui lòng kiểm tra lại.");
    }
    throw error;
  }
};

export const generateImageFromPrompt = async (
  apiKey: string,
  prompt: string,
  aspectRatio: string = '3:4',
  resolution: string = '1k'
): Promise<string> => {
    if (!apiKey) throw new Error("Missing API Key");

    const ai = new GoogleGenAI({ apiKey: apiKey });

    // Enhance prompt for 2K resolution request if using Imagen 4.0
    // Imagen 4.0 handles quality natively, but keywords help reinforce the style.
    let finalPrompt = prompt;
    if (resolution === '2k') {
        finalPrompt = `${prompt}, highly detailed, 8k resolution, masterpiece, sharp focus, best quality`;
    }

    // SANITIZE ASPECT RATIO
    // Valid values for Imagen: "1:1", "3:4", "4:3", "9:16", "16:9"
    // If '2:1' (which caused error) or other unsupported value is passed, default to a safe one.
    const validRatios = ['1:1', '3:4', '4:3', '9:16', '16:9'];
    let safeAspectRatio = aspectRatio;
    
    if (!validRatios.includes(safeAspectRatio)) {
        console.warn(`Aspect ratio '${aspectRatio}' is not supported by Imagen. Fallback logic applied.`);
        if (safeAspectRatio === '2:1') {
            safeAspectRatio = '16:9'; // Closest wide format
        } else {
            safeAspectRatio = '1:1'; // Default safe
        }
    }

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: finalPrompt,
            config: {
                numberOfImages: 1,
                aspectRatio: safeAspectRatio, 
                outputMimeType: 'image/jpeg',
            }
        });

        const base64Image = response.generatedImages?.[0]?.image?.imageBytes;
        
        if (!base64Image) {
            // Check if there is any other info in the response
            console.log("Empty Image Response:", JSON.stringify(response, null, 2));
            throw new Error("Không tạo được ảnh (No image returned).");
        }

        return `data:image/jpeg;base64,${base64Image}`;

    } catch (error: any) {
        console.error("Imagen API Error:", error);
         if (error.message && (error.message.includes("403") || error.message.includes("API key"))) {
            throw new Error("Lỗi quyền truy cập API. Vui lòng kiểm tra Key.");
        }
        if (error.message && error.message.includes("SAFETY")) {
             throw new Error("Ảnh bị chặn bởi bộ lọc an toàn của Google. Vui lòng thử lại với prompt khác.");
        }
        throw new Error("Lỗi khi tạo ảnh: " + error.message);
    }
}