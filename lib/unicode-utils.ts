// Categories of potentially suspicious Unicode characters
const SUSPICIOUS_CATEGORIES = [
  "ZERO WIDTH",
  "INVISIBLE",
  "CONTROL",
  "FORMATTING",
  "VARIATION",
  "JOINER",
  "DIRECTION",
  "BIDIRECTIONAL",
  "HOMOGLYPH",
  "PRIVATE USE",
  "SURROGATE",
  "NONCHARACTER",
]

// Whitelist of common Unicode characters that should not be flagged
const COMMON_WHITELIST = [
  0x0009, // Tab
  0x000a, // Line Feed (newline)
  0x000d, // Carriage Return
  0x0020, // Space
  0x0021, // !
  0x0022, // "
  0x0023, // #
  0x0024, // $
  0x0025, // %
  0x0026, // &
  0x0027, // '
  0x0028, // (
  0x0029, // )
  0x002a, // *
  0x002b, // +
  0x002c, // ,
  0x002d, // -
  0x002e, // .
  0x002f, // /
  // 0-9
  0x0030,
  0x0031,
  0x0032,
  0x0033,
  0x0034,
  0x0035,
  0x0036,
  0x0037,
  0x0038,
  0x0039,
  0x003a, // :
  0x003b, // ;
  0x003c, // <
  0x003d, // =
  0x003e, // >
  0x003f, // ?
  0x0040, // @
  // A-Z
  0x0041,
  0x0042,
  0x0043,
  0x0044,
  0x0045,
  0x0046,
  0x0047,
  0x0048,
  0x0049,
  0x004a,
  0x004b,
  0x004c,
  0x004d,
  0x004e,
  0x004f,
  0x0050,
  0x0051,
  0x0052,
  0x0053,
  0x004f,
  0x0055,
  0x0056,
  0x0057,
  0x0058,
  0x0059,
  0x005a,
  0x005b, // [
  0x005c, // \
  0x005d, // ]
  0x005e, // ^
  0x005f, // _
  0x0060, // `
  // a-z
  0x0061,
  0x0062,
  0x0063,
  0x0064,
  0x0065,
  0x0066,
  0x0067,
  0x0068,
  0x0069,
  0x006a,
  0x006b,
  0x006c,
  0x006d,
  0x006e,
  0x006f,
  0x0070,
  0x0071,
  0x0072,
  0x0073,
  0x0074,
  0x0075,
  0x0076,
  0x0077,
  0x0078,
  0x0079,
  0x007a,
  0x007b, // {
  0x007c, // |
  0x007d, // }
  0x007e, // ~
]

// Common Unicode ranges that should be allowed
const COMMON_RANGES = [
  // Basic Latin (ASCII)
  [0x0020, 0x007e], // Printable ASCII

  // Latin-1 Supplement (common accented characters)
  [0x00a0, 0x00ff],

  // Common punctuation and symbols
  [0x2010, 0x2027], // Hyphens, dashes, bullets
  [0x2030, 0x2043], // Per mille, quotes, etc.

  // Currency symbols
  [0x20a0, 0x20cf],

  // Common mathematical symbols
  [0x2200, 0x22ff],

  // Arrows
  [0x2190, 0x21ff],
]

// Map of known homoglyphs (characters that look similar to common ASCII)
const HOMOGLYPHS: Record<number, string> = {
  1072: "CYRILLIC SMALL LETTER A (looks like Latin a)",
  1077: "CYRILLIC SMALL LETTER IE (looks like Latin e)",
  1086: "CYRILLIC SMALL LETTER O (looks like Latin o)",
  1088: "CYRILLIC SMALL LETTER ER (looks like Latin p)",
  1089: "CYRILLIC SMALL LETTER ES (looks like Latin c)",
  1091: "CYRILLIC SMALL LETTER U (looks like Latin y)",
  1093: "CYRILLIC SMALL LETTER HA (looks like Latin x)",
  1109: "CYRILLIC SMALL LETTER DZE (looks like Latin s)",
  8722: "MINUS SIGN (looks like hyphen)",
  // Add more as needed
}

// Special Unicode ranges that are often used in attacks
const SUSPICIOUS_RANGES = [
  // Zero-width characters
  [0x200b, 0x200f], // Zero width space, non-breaking space, etc.
  [0x2060, 0x2064], // Word joiner, invisible times, etc.
  [0xfeff, 0xfeff], // Zero width no-break space

  // Bidirectional text control
  [0x2066, 0x2069], // Bidirectional isolate controls
  [0x202a, 0x202e], // Bidirectional embedding controls

  // Control characters
  [0x0000, 0x001f], // C0 control characters
  [0x007f, 0x009f], // Delete and C1 control characters

  // Private use areas
  [0xe000, 0xf8ff], // Private Use Area
  [0xf0000, 0xffffd], // Supplementary Private Use Area-A
  [0x100000, 0x10fffd], // Supplementary Private Use Area-B

  // Surrogates
  [0xd800, 0xdfff], // Surrogate code points

  // Noncharacters
  [0xfdd0, 0xfdef], // Noncharacters
  [0xfffe, 0xffff], // Noncharacters
  // Add more as needed
]

// Map of ASCII to visually similar (homoglyph) characters
const HOMOGLYPH_MAP: Record<string, string> = {
  'a': 'а', // Cyrillic а (U+0430)
  'c': 'с', // Cyrillic с (U+0441)
  'e': 'е', // Cyrillic е (U+0435)
  'o': 'о', // Cyrillic о (U+043E)
  'p': 'р', // Cyrillic р (U+0440)
  'x': 'х', // Cyrillic х (U+0445)
  'y': 'у', // Cyrillic у (U+0443)
  '3': 'з', // Cyrillic з (U+0437)
  'B': 'В', // Cyrillic В (U+0412)
  'H': 'Н', // Cyrillic Н (U+041D)
  'P': 'Р', // Cyrillic Р (U+0420)
  'C': 'С', // Cyrillic С (U+0421)
  'X': 'Х', // Cyrillic Х (U+0425)
  '-': '‐', // Non-breaking hyphen (U+2010)
  '.': '․', // One dot leader (U+2024)
  ',': '‚', // Single low-9 quotation mark (U+201A)
}

// Reverse map for decoding
const REVERSE_HOMOGLYPH_MAP = Object.entries(HOMOGLYPH_MAP).reduce((acc, [k, v]) => {
  acc[v] = k
  return acc
}, {} as Record<string, string>)

// Update the isInSuspiciousRange function to check if a code point is in any of the common ranges
function isInCommonRange(codePoint: number): boolean {
  // Check if it's in the whitelist
  if (COMMON_WHITELIST.includes(codePoint)) {
    return true
  }

  // Check if it's in any of the common ranges
  return COMMON_RANGES.some(([start, end]) => codePoint >= start && codePoint <= end)
}

// Function to check if a code point is in any of the suspicious ranges
function isInSuspiciousRange(codePoint: number): boolean {
  return SUSPICIOUS_RANGES.some(([start, end]) => codePoint >= start && codePoint <= end)
}

// Function to get a description for a code point
function getCharacterDescription(char: string, codePoint: number): string {
  // Check for known homoglyphs
  if (HOMOGLYPHS[codePoint]) {
    return HOMOGLYPHS[codePoint]
  }

  // Try to get the official Unicode name
  try {
    // This is a browser API, may not be available in all environments
    return String(char).normalize("NFD")
  } catch (e) {
    // Fallback descriptions based on ranges
    if (codePoint >= 0x0000 && codePoint <= 0x001f) {
      return "C0 CONTROL CHARACTER"
    } else if (codePoint === 0x007f) {
      return "DELETE CONTROL CHARACTER"
    } else if (codePoint >= 0x0080 && codePoint <= 0x009f) {
      return "C1 CONTROL CHARACTER"
    } else if (codePoint === 0x200b) {
      return "ZERO WIDTH SPACE"
    } else if (codePoint === 0x200c) {
      return "ZERO WIDTH NON-JOINER"
    } else if (codePoint === 0x200d) {
      return "ZERO WIDTH JOINER"
    } else if (codePoint === 0x200e) {
      return "LEFT-TO-RIGHT MARK"
    } else if (codePoint === 0x200f) {
      return "RIGHT-TO-LEFT MARK"
    } else if (codePoint >= 0x202a && codePoint <= 0x202e) {
      return "BIDIRECTIONAL CONTROL CHARACTER"
    } else if (codePoint >= 0x2066 && codePoint <= 0x2069) {
      return "BIDIRECTIONAL ISOLATE CONTROL"
    } else if (codePoint === 0xfeff) {
      return "ZERO WIDTH NO-BREAK SPACE (BYTE ORDER MARK)"
    } else if (codePoint >= 0xe000 && codePoint <= 0xf8ff) {
      return "PRIVATE USE CHARACTER"
    } else if (codePoint >= 0xd800 && codePoint <= 0xdfff) {
      return "SURROGATE CODE POINT"
    } else if ((codePoint >= 0xfdd0 && codePoint <= 0xfdef) || (codePoint & 0xfffe) === 0xfffe) {
      return "NONCHARACTER"
    }

    return "SUSPICIOUS CHARACTER"
  }
}

// Modify the isSuspiciousCharacter function to check the whitelist first
function isSuspiciousCharacter(char: string): boolean {
  const codePoint = char.codePointAt(0) || 0

  // Check if it's a common character first
  if (isInCommonRange(codePoint)) {
    return false
  }

  // Check if it's in a suspicious range
  if (isInSuspiciousRange(codePoint)) {
    return true
  }

  // Check if it's a homoglyph
  if (HOMOGLYPHS[codePoint]) {
    return true
  }

  // Check if it's invisible or has zero width
  if (/\p{White_Space}/u.test(char) && char !== " " && char !== "\t" && char !== "\n" && char !== "\r") {
    return true
  }

  // Check for other suspicious categories
  const description = getCharacterDescription(char, codePoint)
  return SUSPICIOUS_CATEGORIES.some((category) => description.toUpperCase().includes(category))
}

// Function to analyze text for suspicious Unicode characters
export function analyzeText(text: string) {
  if (!text) {
    return {
      totalCharacters: 0,
      visibleCharacters: 0,
      invisibleCharacters: 0,
      suspiciousCharacters: [],
      categories: {},
    }
  }

  const result = {
    totalCharacters: 0,
    visibleCharacters: 0,
    invisibleCharacters: 0,
    suspiciousCharacters: [] as Array<{
      char: string
      codePoint: number
      index: number
      description: string
    }>,
    categories: {} as Record<string, number>,
  }

  // Analyze each character
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const codePoint = text.codePointAt(i) || 0

    // Skip the second code unit of surrogate pairs
    if (codePoint > 0xffff) {
      i++
    }

    result.totalCharacters++

    // Check if it's a visible character
    const isVisible =
      /\S/.test(char) &&
      char !== "\u200B" && // zero width space
      char !== "\u200C" && // zero width non-joiner
      char !== "\u200D" && // zero width joiner
      char !== "\u2060" && // word joiner
      char !== "\uFEFF" // zero width no-break space

    if (isVisible) {
      result.visibleCharacters++
    } else {
      result.invisibleCharacters++
    }

    // Check if it's suspicious
    if (isSuspiciousCharacter(char)) {
      const description = getCharacterDescription(char, codePoint)

      result.suspiciousCharacters.push({
        char,
        codePoint,
        index: i,
        description,
      })

      // Categorize the character
      const category = description.split(" ")[0]
      result.categories[category] = (result.categories[category] || 0) + 1
    }
  }

  return result
}

// Function to clean text by removing suspicious Unicode characters
export function cleanText(text: string): string {
  if (!text) return ""

  let cleanedText = ""

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const codePoint = text.codePointAt(i) || 0

    // Skip the second code unit of surrogate pairs
    if (codePoint > 0xffff) {
      i++
    }

    // Only keep non-suspicious characters
    if (!isSuspiciousCharacter(char)) {
      cleanedText += char
    }
  }

  return cleanedText
}

// Function to extract only suspicious characters from text
export function extractHiddenText(text: string): string {
  if (!text) return ""

  let extractedText = ""

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const codePoint = text.codePointAt(i) || 0

    // Skip the second code unit of surrogate pairs
    if (codePoint > 0xffff) {
      i++
    }

    // Only keep suspicious characters
    if (isSuspiciousCharacter(char)) {
      extractedText += char
    }
  }

  return extractedText
}

// Common Unicode steganography methods
const ZERO_WIDTH_CHARS = {
  "\u200B": 0, // Zero width space as binary 0
  "\u200C": 1, // Zero width non-joiner as binary 1
  "\u200D": 2, // Zero width joiner as binary 2 (some systems use this as delimiter)
  "\u2060": 3, // Word joiner (sometimes used as an alternative to ZWSP)
  "\uFEFF": 4, // Zero width no-break space (sometimes used as delimiter)
}

// Function to decode hidden messages using different strategies
export function decodeHiddenText(text: string): {
  extracted: string
  decodings: Array<{
    method: string
    result: string
    confidence: number
  }>
} {
  if (!text) {
    return {
      extracted: "",
      decodings: [],
    }
  }

  // Extract suspicious characters
  const hiddenChars = extractHiddenText(text)
  if (!hiddenChars) {
    return {
      extracted: "",
      decodings: [],
    }
  }
  console.log("hiddenChars", hiddenChars);
  // Apply different decoding strategies
  const decodings = []

  // 1. Direct extraction - the raw invisible characters (shown as their Unicode code points)
  decodings.push({
    method: "Raw Unicode Points",
    result: Array.from(hiddenChars)
      .map(char => `U+${char.codePointAt(0)?.toString(16).toUpperCase().padStart(4, "0")}`)
      .join(" "),
    confidence: 1.0, // This is always accurate
  })

  // 2. Binary decoding (treating zero-width characters as binary)
  const binaryResult = decodeBinary(hiddenChars)
  if (binaryResult) {
    decodings.push({
      method: "Binary (ZWSP/ZWNJ)",
      result: binaryResult,
      confidence: 0.7, // Confidence depends on whether the result makes sense
    })
  }

  // 3. Direct Unicode mapping
  const directResult = decodeDirectUnicode(hiddenChars)
  if (directResult) {
    decodings.push({
      method: "Direct Unicode Mapping (PUA)",
      result: directResult,
      confidence: 0.8,
    })
  }
  
  // 4. Whitespace variation decoding
  const whitespaceResult = decodeWhitespace(hiddenChars)
  if (whitespaceResult) {
    decodings.push({
      method: "Whitespace Variation",
      result: whitespaceResult,
      confidence: 0.65,
    })
  }

  // 5. Attempt direct ASCII interpretation
  const asciiResult = decodeAsAscii(hiddenChars)
  if (asciiResult) {
    decodings.push({
      method: "ASCII/UTF-8",
      result: asciiResult,
      confidence: 0.6,
    })
  }

  // 6. Try homoglyph decoding directly on the full text
  const homoglyphResult = decodeHomoglyphs(text)
  if (homoglyphResult) {
    decodings.push({
      method: "Homoglyph Substitution",
      result: homoglyphResult,
      confidence: 0.5, // Lower confidence because it's pattern-based
    })
  }

  return {
    extracted: hiddenChars,
    decodings,
  }
}

// Helper function to decode binary patterns from zero-width characters
function decodeBinary(hiddenChars: string): string | null {
  // Convert sequence of zero-width characters to binary
  let binaryString = ""
  
  for (const char of hiddenChars) {
    if (char === "\u200B") { // ZWSP
      binaryString += "0"
    } else if (char === "\u200C") { // ZWNJ
      binaryString += "1"
    } else if (char === "\u200D" || char === "\uFEFF") {
      // Some encodings use ZWJ or ZWNBSP as separators, ignore them
      continue
    } else {
      // If we encounter non-binary characters, this might not be binary encoding
      // But we'll still try to parse what we have
    }
  }
  
  // If we didn't get any binary digits, this isn't a binary encoding
  if (!binaryString.match(/[01]/)) {
    return null
  }
  
  // Convert binary to text (8-bit chunks)
  try {
    let result = ""
    
    // Process 8 bits at a time
    for (let i = 0; i < binaryString.length; i += 8) {
      const byte = binaryString.substr(i, 8)
      
      // Skip if we don't have a full byte
      if (byte.length < 8) continue
      
      // Convert binary byte to decimal
      const decimal = parseInt(byte, 2)
      
      // Convert decimal to ASCII character
      const char = String.fromCharCode(decimal)
      result += char
    }
    
    return result || null
  } catch (e) {
    return null
  }
}

// Helper function to try direct ASCII/UTF-8 interpretation
function decodeAsAscii(hiddenChars: string): string | null {
  try {
    // Some attacks directly use control characters or specific Unicode points
    // that map to ASCII or readable text when interpreted differently
    
    // Try to convert code points to ASCII range
    const result = Array.from(hiddenChars)
      .map(char => {
        const code = char.codePointAt(0) || 0
        
        // Only include printable ASCII characters
        if (code >= 32 && code <= 126) {
          return String.fromCharCode(code)
        }
        
        // Try modulo 128 to see if there's a pattern
        const asciiCode = code % 128
        if (asciiCode >= 32 && asciiCode <= 126) {
          return String.fromCharCode(asciiCode)
        }
        
        return ""
      })
      .join("")
    
    return result || null
  } catch (e) {
    return null
  }
}

// Utility function to encode a message using zero-width characters (for testing)
export function encodeHiddenMessage(message: string): string {
  // Convert message to binary (8 bits per character)
  let binaryString = ""
  
  for (let i = 0; i < message.length; i++) {
    const charCode = message.charCodeAt(i)
    const binaryChar = charCode.toString(2).padStart(8, "0")
    binaryString += binaryChar
  }
  
  // Convert binary to zero-width characters
  let encodedMessage = ""
  
  for (let i = 0; i < binaryString.length; i++) {
    if (binaryString[i] === "0") {
      encodedMessage += "\u200B" // Zero width space
    } else {
      encodedMessage += "\u200C" // Zero width non-joiner
    }
  }
  
  return encodedMessage
}

// Direct Unicode mapping encoding (using PUA - Private Use Area)
export function encodeDirectUnicode(message: string): string {
  let encodedMessage = ""
  
  // Map each character to a Private Use Area character starting at U+E000
  for (let i = 0; i < message.length; i++) {
    const charCode = message.charCodeAt(i)
    // Map ASCII to PUA range (U+E000 to U+E0FF)
    const puaChar = String.fromCodePoint(0xE000 + charCode)
    encodedMessage += puaChar
  }
  
  return encodedMessage
}

// Whitespace variation encoding
export function encodeWhitespaceVariation(message: string): string {
  let encodedMessage = ""
  
  // Use a combination of different whitespace characters to encode each letter
  // We'll use a triplet of whitespace characters for each ASCII character
  const whitespaces = [
    "\u0020", // Regular Space
    "\u00A0", // Non-breaking Space
    "\u2000", // En Quad
    "\u2001", // Em Quad
    "\u2002", // En Space
    "\u2003", // Em Space
    "\u2004", // Three-Per-Em Space
    "\u2005", // Four-Per-Em Space
  ]
  
  for (let i = 0; i < message.length; i++) {
    const charCode = message.charCodeAt(i)
    
    // Create a "triplet" for each character by using the char code
    // to select 3 different whitespace characters
    const first = whitespaces[charCode % 8]
    const second = whitespaces[(charCode >> 3) % 8]
    const third = whitespaces[(charCode >> 6) % 8]
    
    encodedMessage += first + second + third
  }
  
  return encodedMessage
}

// Helper function to decode whitespace variations
function decodeWhitespace(hiddenChars: string): string | null {
  try {
    const whitespaces = [
      "\u0020", // Regular Space
      "\u00A0", // Non-breaking Space
      "\u2000", // En Quad
      "\u2001", // Em Quad
      "\u2002", // En Space
      "\u2003", // Em Space
      "\u2004", // Three-Per-Em Space
      "\u2005", // Four-Per-Em Space
    ]
    
    let result = ""
    
    // Process triplets of whitespace characters
    for (let i = 0; i < hiddenChars.length; i += 3) {
      if (i + 2 >= hiddenChars.length) break
      
      const first = whitespaces.indexOf(hiddenChars[i])
      const second = whitespaces.indexOf(hiddenChars[i + 1])
      const third = whitespaces.indexOf(hiddenChars[i + 2])
      
      // Skip if any character in the triplet wasn't recognized
      if (first === -1 || second === -1 || third === -1) continue
      
      // Reconstruct the ASCII code
      const charCode = first + (second << 3) + (third << 6)
      
      // Only include printable ASCII
      if (charCode >= 32 && charCode <= 126) {
        result += String.fromCharCode(charCode)
      }
    }
    
    return result || null
  } catch (e) {
    return null
  }
}

// Helper function to decode direct Unicode mapping
function decodeDirectUnicode(hiddenChars: string): string | null {
  try {
    let result = ""
    
    for (const char of hiddenChars) {
      const code = char.codePointAt(0) || 0
      
      // Check if it's in the PUA range we use for encoding
      if (code >= 0xE000 && code <= 0xE0FF) {
        // Convert back to ASCII
        const asciiCode = code - 0xE000
        if (asciiCode >= 32 && asciiCode <= 126) {
          result += String.fromCharCode(asciiCode)
        }
      }
    }
    
    return result || null
  } catch (e) {
    return null
  }
}

// Homoglyph substitution encoding
export function encodeHomoglyphs(text: string, secretMessage: string): string {
  // This method works by replacing some letters in the visible text with 
  // visually similar characters. The pattern of replacements encodes the message.
  
  // Convert secret message to binary
  let binaryMessage = ""
  for (let i = 0; i < secretMessage.length; i++) {
    const binary = secretMessage.charCodeAt(i).toString(2).padStart(8, '0')
    binaryMessage += binary
  }
  
  let result = ""
  let binaryIndex = 0
  
  // Replace characters according to the binary message
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    
    // If we've encoded the entire message, just add the remaining text
    if (binaryIndex >= binaryMessage.length) {
      result += text.substring(i)
      break
    }
    
    // If the character has a homoglyph and the current bit is 1, replace it
    if (HOMOGLYPH_MAP[char] && binaryMessage[binaryIndex] === '1') {
      result += HOMOGLYPH_MAP[char]
    } else {
      result += char
    }
    
    // Only increment binary index if we had an opportunity to encode
    if (HOMOGLYPH_MAP[char]) {
      binaryIndex++
    }
  }
  
  return result
}

// Helper function to decode homoglyph substitutions
function decodeHomoglyphs(text: string): string | null {
  // Find all homoglyphs in the text
  let binaryMessage = ""
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    
    // Check if it's a known homoglyph
    if (REVERSE_HOMOGLYPH_MAP[char]) {
      binaryMessage += '1' // This character was replaced
    } 
    // Check if it's a letter that could have been substituted
    else if (HOMOGLYPH_MAP[char]) {
      binaryMessage += '0' // This character wasn't replaced
    }
    // Otherwise it's not part of the encoding
  }
  
  // Convert binary back to text
  let result = ""
  for (let i = 0; i < binaryMessage.length; i += 8) {
    if (i + 8 > binaryMessage.length) break
    
    const byte = binaryMessage.substr(i, 8)
    const decimal = parseInt(byte, 2)
    
    // Only include printable ASCII
    if (decimal >= 32 && decimal <= 126) {
      result += String.fromCharCode(decimal)
    }
  }
  
  return result || null
}

