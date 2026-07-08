<div align="center">

# 🎨 chroma-flow

**एक बीज से सुलभ रंग प्रणालियाँ।**

एक शून्य-निर्भरता वाली TypeScript लाइब्रेरी और CLI जो आधुनिक **OKLCH** रंग स्पेस का उपयोग करके अवधारणात्मक रूप से एकसमान,
WCAG-अनुपालक और रंग-अंधता-सुरक्षित रंग पटल (पैलेट) उत्पन्न करती है।

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-success.svg)](#)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Good First Issues](https://img.shields.io/github/issues/Cryptoteep/chroma-flow/good%20first%20issue?label=good%20first%20issue&color=7057ff)](https://github.com/Cryptoteep/chroma-flow/issues?q=is%3Aissue+is+open+label%3A%22good+first+issue%22)

</div>

---

## 🌱 मिशन

> **सुलभ डिज़ाइन को सभी के लिए मुफ्त और सहज बनाएं।**

रंग सुलभता एक प्रीमियम सुविधा नहीं होनी चाहिए जो भुगतान वाले डिज़ाइन टूल के पीछे बंद हो।
हर 12 में से 1 पुरुष और हर 200 में से 1 महिला किसी न किसी प्रकार की रंग दृष्टि की कमी के साथ जीते हैं,
फिर भी अधिकांश उत्पन्न पटलों की इसके खिलाफ कभी जांच नहीं की जाती है।
`chroma-flow` एक छोटे, बिना किसी निर्भरता वाले पैकेज में WCAG 2.1 कंट्रास्ट जांच और रंग-अंधता सिमुलेशन प्रदान करता है
ताकि *हर* डेवलपर समावेशी इंटरफ़ेस बना सके — बिना किसी SaaS, साइनअप या ट्रैकिंग के।

यह एक गैर-वाणिज्यिक, समुदाय-संचालित परियोजना है। इसे कभी भी पेवॉल, विज्ञापन-समर्थित या अधिग्रहित नहीं किया जाएगा।

## ✨ विशेषताएँ

- 🧪 **OKLCH-आधारित जनरेशन** — अवधारणात्मक रूप से एकसमान रैंप जो मानव आंख को संतुलित दिखते हैं।
- ♿ **WCAG 2.1 कंट्रास्ट जांच** — सामान्य और बड़े टेक्स्ट के लिए AA/AAA अनुरूपता।
- 📏 **APCA कंट्रास्ट (WCAG 3 उम्मीदवार)** — हस्ताक्षरित अवधारणात्मक Lc मान, डार्क थीम के लिए WCAG 2.1 से अधिक सटीक।
- 🌗 **लाइट + डार्क थीम जनरेशन** — एक बीज से समन्वित सिमैंटिक थीम जोड़ी (बैकग्राउंड, सरफेस, टेक्स्ट, प्राइमरी, एक्सेंट, सक्सेस/वॉर्निंग/डेंजर), प्रति-भूमिका WCAG + APCA ऑडिट के साथ।
- 👁️ **रंग-अंधता सिमुलेशन** — प्रोटानोपिया, ड्यूटेरानोपिया, ट्राइटानोपिया, अक्रोमेटोप्सिया।
- 🎯 **स्मार्ट टेक्स्ट-रंग सुझाव** — किसी भी बैकग्राउंड के लिए स्वचालित रूप से काला या सफेद टेक्स्ट चुनें।
- 📤 **आठ निर्यात प्रारूप** — CSS वेरिएबल्स, Tailwind कॉन्फ़िग, JSON, SCSS, SVG स्वैच शीट्स, Android `colors.xml`, SwiftUI `Color`, Jetpack Compose `Color`।
- 🖥️ **CLI + लाइब्रेरी** — कोड में या टर्मिनल से उपयोग करें।
- 🪶 **शून्य रनटाइम निर्भरताएँ** — एक दोपहर में ऑडिट करने योग्य, बहुत छोटा शिप होता है।
- 🌲 **ट्री-शेकेबल ESM** — केवल वही आयात करें जो आप उपयोग करते हैं।

## 📦 स्थापना

```bash
npm install chroma-flow
# या
bun add chroma-flow
# या
pnpm add chroma-flow
```

CLI को वैश्विक रूप से उपयोग करें:

```bash
npm install -g chroma-flow
chroma-flow "#6366f1" --format css
```

…या `bunx`/`npx` के साथ एक बार चलाएँ:

```bash
bunx chroma-flow "#6366f1"
```

## 🚀 त्वरित आरंभ

### लाइब्रेरी

```ts
import {
  generatePalette,
  checkContrast,
  suggestTextColor,
  simulateAll,
  exportPalette,
} from "chroma-flow";

// 1. एक बीज से पूरा 50–950 पैलेट जनरेट करें।
const palette = generatePalette("#6366f1");
console.log(palette[500]); // "#6265f0"

// 2. इसे CSS वेरिएबल्स में निर्यात करें।
const css = exportPalette(palette, "css", "primary");

// 3. किसी बैकग्राउंड के लिए सबसे पढ़ने योग्य टेक्स्ट रंग चुनें।
const text = suggestTextColor(palette[600]); // "#ffffff"

// 4. WCAG अनुरूपता जांचें।
const result = checkContrast(text, palette[600]);
console.log(result.ratio);           // 8.48
console.log(result.passesAAANormal); // true

// 5. रंग दृष्टि की कमी के तहत बीज का पूर्वावलोकन करें।
simulateAll(palette[500]).forEach((p) =>
  console.log(p.type, p.hex)
);

// 6. (v0.2) APCA अवधारणात्मक कंट्रास्ट जांचें (WCAG 3 उम्मीदवार)।
import { checkAPCA } from "chroma-flow";
const apca = checkAPCA("#ffffff", palette[600]);
console.log(apca.Lc);               // -87.6  (ऋणात्मक = डार्क पर हल्का टेक्स्ट)
console.log(apca.passesBodyText);   // true   (|Lc| ≥ 75)

// 7. (v0.2) एक समन्वित लाइट + डार्क थीम जनरेट करें।
import { generateTheme, themeToCSS } from "chroma-flow";
const theme = generateTheme("#6366f1");
console.log(theme.light.primary);   // "#3f37bb"
console.log(theme.dark.primary);    // "#8b95ff"
const themeCss = themeToCSS(theme, "brand"); // :root {…} .dark {…}
```

### CLI

```bash
# एक पैलेट जनरेट करें
chroma-flow "#6366f1"

#  50  #e8f5ff  █
# 100  #deecff  ██
# 200  #cad9ff  ████
# ...

# CSS वेरिएबल्स के रूप में निर्यात करें
chroma-flow "#6366f1" --format css --name primary

# SwiftUI / Jetpack Compose के रूप में निर्यात करें (v0.2)
chroma-flow "#6366f1" --format swift --name brand
chroma-flow "#6366f1" --format compose --name Brand

# WCAG 2.1 कंट्रास्ट जांचें
chroma-flow "#f59e0b" --contrast "#000000"

# APCA अवधारणात्मक कंट्रास्ट जांचें (v0.2)
chroma-flow "#10b981" --apca "#ffffff"

# एक समन्वित लाइट + डार्क थीम जोड़ी जनरेट करें (v0.2)
chroma-flow "#6366f1" --theme --name brand

# रंग दृष्टि की कमी का अनुकरण करें
chroma-flow "#6366f1" --cvd

# रैंप को समायोजित करें
chroma-flow "#6366f1" --distribution linear --hue-shift -20 --chroma-falloff 0.7
```

## 🧠 यह कैसे काम करता है

`chroma-flow` आपके बीज रंग को **OKLCH** रंग स्पेस (OKLab का एक बेलनाकार रूप) में परिवर्तित करता है,
फिर क्रोमा को एक फॉलऑफ वक्र और एक वैकल्पिक ह्यू शिफ्ट के साथ मॉड्युलेट करते हुए 11 स्टॉप पर एक हल्कापन रैंप चलाता है।
परिणाम एक चिकना, प्राकृतिक-अनुभव वाला स्केल है जहाँ हर स्टॉप sRGB गैमट के अंदर रहता है।

OKLCH को HSL पर इसलिए चुना गया है क्योंकि HSL हल्कापन **अवधारणात्मक रूप से एकसमान नहीं** है —
आंख के लिए "50% हल्कापन" वाला पीला "50% हल्कापन" वाले नीले की तुलना में कहीं अधिक चमकीला होता है।
OKLCH इसे ठीक करता है, इसलिए रैंप वास्तव में संतुलित दिखते हैं।

```
बीज hex
   │
   ▼
┌──────────┐    ┌──────────────┐    ┌──────────────┐
│ sRGB →   │ ─► │ हल्कापन      │ ─► │ क्रोमा       │
│ OKLCH    │    │ रैंप (11)    │    │ फॉलऑफ      │
└──────────┘    └──────────────┘    └──────┬───────┘
                                            │
                            ┌───────────────┴───────────────┐
                            ▼                               ▼
                    WCAG कंट्रास्ट जांच          CVD सिमुलेशन
                    (AA / AAA)                    (4 स्थितियाँ)
                            │                               │
                            └───────────────┬───────────────┘
                                            ▼
                            CSS / Tailwind / JSON / SCSS / SVG / XML
```

## 📚 API

### `generatePalette(seed, options?)`
एक `Record<50|100|…|950, string>` पैलेट लौटाता है।

| विकल्प          | प्रकार                        | डिफ़ॉल्ट        | विवरण                                           |
| --------------- | ----------------------------- | --------------- | ----------------------------------------------- |
| `distribution`  | `"linear" \| "perceptual"`    | `"perceptual"`  | रैंप में हल्कापन वितरण।                        |
| `chromaFalloff` | `number` (0–1)                | `0.5`           | मध्य-स्वर बनाम चरम सीमाओं की जीवंतता।          |
| `hueShift`      | `number` (डिग्री)             | `0`             | रैंप में ह्यू का बहाव।                          |
| `maxChroma`     | `number`                      | `0.32`          | गैमट से बाहर के रंगों से बचने के लिए क्लैंप।    |

### `checkContrast(foreground, background)`
`{ ratio, passesAANormal, passesAALarge, passesAAANormal, passesAAALarge }` लौटाता है।

### `simulateAll(hex)`
सभी चार CVD प्रकारों के लिए `{ type, hex, original }` की एक सरणी लौटाता है।

### `suggestTextColor(background)`
`"#000000"` या `"#ffffff"` लौटाता है, जिसमें अधिक कंट्रास्ट हो।

### `exportPalette(palette, format, name?)`
`"css" | "tailwind" | "json" | "scss" | "svg" | "android-xml"` में निर्यात करता है।

पूर्ण सूची के लिए [पूर्ण API संदर्भ](docs/API.md) देखें।

## 🤝 योगदान

योगदान वही है जो ओपन-सोर्स समुदाय को सीखने, प्रेरित करने और बनाने के लिए एक अद्भुत स्थान बनाता है।
आपके द्वारा किए गए किसी भी योगदान की **अत्यधिक सराहना** की जाती है।

- 🐛 कोई बग मिला? [एक इश्यू खोलें](https://github.com/Cryptoteep/chroma-flow/issues/new?template=bug_report.md)।
- 💡 कोई विचार है? [एक सुविधा सुझाएँ](https://github.com/Cryptoteep/chroma-flow/issues/new?template=feature_request.md)।
- 🔧 कोड करना चाहते हैं? एक [`good first issue`](https://github.com/Cryptoteep/chroma-flow/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) पकड़ें और [CONTRIBUTING.md](CONTRIBUTING.md) पढ़ें।

कृपया भाग लेने से पहले हमारे [आचार संहिता](CODE_OF_CONDUCT.md) की समीक्षा करें।

## 🗺️ रोडमैप

- [x] ~~APCA कंट्रास्ट समर्थन (WCAG 3 उम्मीदवार)~~ — v0.2.0 में शिप किया गया
- [x] ~~थीम जनरेशन (एक बीज से लाइट + डार्क)~~ — v0.2.0 में शिप किया गया
- [x] ~~Swift + Jetpack Compose एक्सपोर्टर~~ — v0.2.0 में शिप किया गया
- [ ] लाइव वेब प्लेग्राउंड (रिपॉजिटरी में, GitHub Pages पर तैनात)
- [ ] ESM + CJS डुअल बिल्ड
- [ ] Figma प्लगिन
- [ ] डेल्टा-E ∆E2000 रंग अंतर सहायक
- [ ] पूरक / त्रिकोणीय / अनुरूप बीजों की स्वचालित व्युत्पत्ति

## 📄 लाइसेंस

MIT © [Cryptoteep](https://github.com/Cryptoteep)। [LICENSE](LICENSE) देखें।

## 💛 आभार

- [Björn Ottosson](https://bottosson.github.io/posts/oklab/) को OKLab/OKLCH रंग स्पेस के लिए।
- [Machado et al. (2009)](https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html) को रंग दृष्टि की कमी सिमुलेशन मैट्रिसेस के लिए।
- W3C को [WCAG 2.1 कंट्रास्ट विनिर्देश](https://www.w3.org/TR/WCAG21/) के लिए।

<div align="center">

**⭐ अगर chroma-flow आपको कुछ अधिक सुलभ बनाने में मदद करता है, तो कृपया रिपॉजिटरी को स्टार करें — इससे दूसरों को इसे खोजने में मदद मिलती है।**

</div>
