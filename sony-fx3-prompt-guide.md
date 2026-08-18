# Panduan Template Color Grading: iPhone 11 ke Sony FX3 (Teal & Orange)

Template ini dirancang khusus untuk model AI **Nano Banana 2 (Gemini 3.1 Flash Image)** melalui API `fal-ai/nano-banana-2/edit`. Model ini menggunakan bahasa alami untuk mengedit foto secara langsung tanpa memerlukan masker manual.

## 1. File Template JSON
Kamu bisa menggunakan file template JSON yang sudah dibuat di sini: [sony-fx3-template.json](file:///Users/unicom/Documents/Kuliah/Belajar/Website-Portfolio/sony-fx3-template.json).

```json
{
  "image_url": "https://url-gambar-kamu.com/foto-iphone.jpg",
  "time_of_day": "sunset golden hour",
  "background_location": "a busy street in Shibuya, Tokyo, with neon lights",
  "prompt": "Apply professional color grading and style transfer to this image. The source image is a smartphone photo shot on iPhone 11. Replace the original background completely with: {{background_location}}. Adjust the lighting and time of day of the entire scene to match: {{time_of_day}}. Transform the style to look as if it was shot on a professional Sony FX3 cinema camera using S-Cinetone color science. Apply a cinematic 'Teal and Orange' color grading scheme with a warm overall tone: warm golden skin tones and highlights (orange/gold), combined with cool shadows and background tones (teal/cyan) matching the new background. Soften the harsh contrast and replace the fake digital sharpening with high-fidelity, crisp optical sharpness. Emphasize organic textures, sharp focus on the main subject (highly detailed skin pores, crisp clothing fabric), and introduce a natural cinematic depth of field (bokeh) to blur the new background smoothly. Ensure the original subject and facial features remain identical.",
  "resolution": "2K",
  "aspect_ratio": "auto",
  "output_format": "jpeg"
}
```

---

## 2. Cara Kustomisasi & Modifikasi Nada Warna (Tones)

Jika kamu ingin bereksperimen dengan nuansa warna yang berbeda, kamu bisa memodifikasi bagian prompt di dalam JSON:

### A. Jika Ingin Lebih Warm (Lebih Hangat / Golden Hour)
Ganti bagian *Teal and Orange* dengan instruksi:
> *"...Apply a warm golden hour color grading. Emphasize warm amber and gold light source, rich copper skin tones, and soft bronze highlights. The overall mood should feel cozy, sunny, and inviting..."*

### B. Jika Ingin Teal & Orange yang Sangat Kuat (Stylized / Hollywood Look)
Ganti bagian *Teal and Orange* dengan instruksi:
> *"...Apply a heavy, highly stylized Hollywood-style 'Teal and Orange' color grading. Make the shadows deeply saturated with rich teal/cyan, and make all skin tones and highlights pop with vibrant orange/amber tones..."*

### C. Jika Ingin Hasil yang Lebih Netral / Kalem (Natural S-Cinetone)
Ganti bagian *Teal and Orange* dengan instruksi:
> *"...Apply a clean, natural S-Cinetone color grading. Colors should be realistic but soft, with beautiful, lifelike skin tones and slightly desaturated greens and blues..."*

### D. Cara Mengatur Ketajaman Detail (Sharpness & Texture)
Secara bawaan, foto dari HP (seperti iPhone 11) menggunakan *digital sharpening* (penajaman buatan oleh software) yang membuat pinggiran objek terlihat kasar. Kamera pro seperti Sony FX3 memiliki **optical sharpness** (ketajaman asli dari lensa berkualitas tinggi).

* **Untuk Detail Sangat Tajam (Maksimal):** Tambahkan kata kunci seperti:
  > *"...Emphasize ultra-sharp optical details. Every texture should be extremely crisp: detailed skin pores, individual strands of hair, fabric weave of the clothes, and sharp details on the eyes, while maintaining a smooth, natural cinematic roll-off on edges..."*
* **Untuk Detail yang Lebih Lembut (Soft/Dreamy/Filmic):** Tambahkan kata kunci seperti:
  > *"...Add a gentle vintage film texture. Soften the overall digital sharpness, introduce very fine organic film grain, and render skin textures smoothly with a soft-focus filmic quality..."*

---

## 3. Cara Menggunakan via Script Python / Node.js

Karena API Fal.ai hanya menerima parameter `prompt` dalam bentuk satu string tunggal, kita perlu membaca parameter `time_of_day` dan `background_location` di kode kita, lalu mengganti placeholder `{{time_of_day}}` dan `{{background_location}}` di dalam prompt sebelum mengirimnya ke API.

### Python (menggunakan SDK `fal-client`)
```python
import json
import fal_client

# 1. Load data template JSON
with open("sony-fx3-template.json", "r") as f:
    data = json.load(f)

# 2. Atur parameter dinamis sesuai kebutuhan
image_url = "https://link-foto-iphone-kamu.com/image.jpg"
time_of_day = "midnight rainy night"
background_location = "a futuristic cyberpunk street, glowing holograms"

# 3. Ganti placeholder di dalam prompt
final_prompt = data["prompt"].replace("{{time_of_day}}", time_of_day)
final_prompt = final_prompt.replace("{{background_location}}", background_location)

# 4. Kirim ke API Fal.ai
result = fal_client.subscribe(
    "fal-ai/nano-banana-2/edit",
    arguments={
        "image_url": image_url,
        "prompt": final_prompt,
        "resolution": data.get("resolution", "2K")
    }
)

print("Hasil URL gambar baru:", result["image_url"])
```

### Node.js (JavaScript)
```javascript
import { fal } from "@fal-ai/client";
import fs from "fs";

// 1. Load data template JSON
const templateData = JSON.parse(fs.readFileSync("sony-fx3-template.json", "utf8"));

// 2. Atur parameter dinamis sesuai kebutuhan
const imageUrl = "https://link-foto-iphone-kamu.com/image.jpg";
const timeOfDay = "stormy cloudy afternoon";
const backgroundLocation = "on top of a mountain overlooking a misty valley";

// 3. Ganti placeholder di dalam prompt
let finalPrompt = templateData.prompt
  .replace("{{time_of_day}}", timeOfDay)
  .replace("{{background_location}}", backgroundLocation);

// 4. Kirim ke API Fal.ai
const result = await fal.subscribe("fal-ai/nano-banana-2/edit", {
  input: {
    image_url: imageUrl,
    prompt: finalPrompt,
    resolution: templateData.resolution || "2K"
  }
});

console.log("Hasil URL gambar baru:", result.data.image_url);
```

