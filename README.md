# Unicode Analyzer

A comprehensive web application designed to detect, analyze, and clean hidden Unicode characters in text prompts sent to AI systems, helping users identify potential prompt injection or manipulation attempts.

![Unicode Analyzer](public/placeholder.svg)

## Overview

Unicode Analyzer is a powerful tool that helps identify and analyze hidden Unicode characters that might be embedded in text meant for AI systems. Malicious actors can use invisible or deceptive Unicode characters to hide instructions, manipulate AI responses, or bypass content filters. This tool helps make these characters visible and provides options to clean the text.

## Features

- **Unicode Detection**: Identifies all Unicode characters in a text input, including invisible or disguised characters
- **Detailed Analysis**: Displays comprehensive information about each Unicode character, including:
  - Code point
  - Character name
  - Unicode category
  - Risk level assessment
- **Visual Highlighting**: Color-coded highlighting of suspicious characters directly in the text
- **Statistical Breakdown**: Summary of character types and potential risk factors
- **Hidden Message Decoder**: Attempts to extract and decode potential hidden messages using multiple decoding strategies
- **Cleanup Tool**: Sanitizes text by removing or replacing potentially problematic Unicode characters
- **File Upload**: Supports analyzing text from uploaded files

## Use Cases

This tool was created to help:
- Security researchers investigating prompt injection techniques
- AI developers building more robust systems
- Users who want to verify the safety of prompts before sending to AI services
- Organizations concerned about data exfiltration through steganographic techniques

## Getting Started

### Prerequisites

- Node.js 20.0.0 or higher
- pnpm v9.5 above

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/unicode-analyzer/unicode-analyzer.git
   cd unicode-analyzer
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

To create an optimized production build:

```bash
pnpm build
# or
npm run build
```

Then start the production server:

```bash
pnpm start
# or
npm start
```

## How It Works

The Unicode Analyzer uses several strategies to identify potentially malicious Unicode characters:

1. **Suspicious Character Detection**: Characters are classified as suspicious based on:
   - Zero-width characters
   - Invisible formatting characters
   - Control characters
   - Bidirectional text control characters
   - Homoglyphs (characters that look similar to common ASCII)
   - Characters from private use areas

2. **Decoding Methods**: Multiple decoding strategies are employed when attempting to extract hidden messages:
   - Binary decoding (where invisible characters represent 0s and 1s)
   - Direct character conversion
   - Whitespace variation patterns
   - Homoglyph mapping

3. **Cleaning Process**: The cleaning tool removes or replaces suspicious characters while preserving the intended meaning of the text.

## Examples

### Example 1: Detecting Zero-Width Characters

Text that appears normal but contains hidden zero-width characters that could be carrying encoded information:

```
This text has hidden​‌‌​​​​‌​‌‌​‌‌​​​‌‌‌​‌ characters.
```

### Example 2: Identifying Homoglyphs

Text that uses characters that look similar to standard ASCII but are actually different Unicode characters:

```
This looks normal but uses Cyrillic "о" instead of Latin "o"
```

## Development

### Project Structure

- `/app` - Next.js application and page components
- `/components` - React components including the main Unicode analyzer
- `/lib` - Utility functions for Unicode analysis and decoding
- `/public` - Static assets
- `/styles` - Global CSS styles

### Key Components

- `unicode-analyzer.tsx` - Main application component
- `unicode-utils.ts` - Core functions for Unicode analysis and processing
- `unicode-highlighter.tsx` - Visual highlighting of suspicious characters
- `unicode-decoder.tsx` - Component for decoding hidden messages

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- The Unicode Consortium for maintaining Unicode standards
- [Next.js](https://nextjs.org/) and [React](https://reactjs.org/) for the web framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Radix UI](https://www.radix-ui.com/) for accessible UI components

## Security

If you discover a security vulnerability, please report it by opening an issue with the "security" label. 