import type { ContentSegment, Card } from '@/types/chat';

// Marker prefix to find card starts
const CARD_PREFIX = '<<<CARD:';
const CARD_SUFFIX = '>>>';

/**
 * Extract JSON from a string starting at a given position.
 * Handles arbitrary nesting depth by counting braces.
 */
function extractJson(content: string, startIndex: number): { json: string; endIndex: number } | null {
  if (content[startIndex] !== '{') {
    return null;
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = startIndex; i < content.length; i++) {
    const char = content[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\' && inString) {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === '{') {
        depth++;
      } else if (char === '}') {
        depth--;
        if (depth === 0) {
          return {
            json: content.substring(startIndex, i + 1),
            endIndex: i + 1,
          };
        }
      }
    }
  }

  return null;
}

/**
 * Parse message content and extract card markers with nested JSON support.
 */
export function parseMessageContent(content: string): ContentSegment[] {
  // Guard against undefined/null content
  if (!content) {
    return [];
  }

  const segments: ContentSegment[] = [];
  let lastIndex = 0;
  let searchIndex = 0;

  while (searchIndex < content.length) {
    // Find the next card marker
    const markerStart = content.indexOf(CARD_PREFIX, searchIndex);

    if (markerStart === -1) {
      break;
    }

    // Find the card type (between prefix and the colon before JSON)
    const typeStart = markerStart + CARD_PREFIX.length;
    const jsonStart = content.indexOf(':{', typeStart);

    if (jsonStart === -1) {
      searchIndex = markerStart + 1;
      continue;
    }

    const cardType = content.substring(typeStart, jsonStart);

    // Extract the JSON starting after the colon
    const jsonResult = extractJson(content, jsonStart + 1);

    if (!jsonResult) {
      searchIndex = markerStart + 1;
      continue;
    }

    // Check for the closing marker
    const expectedEnd = jsonResult.endIndex;
    if (!content.substring(expectedEnd).startsWith(CARD_SUFFIX)) {
      searchIndex = markerStart + 1;
      continue;
    }

    const fullMatchEnd = expectedEnd + CARD_SUFFIX.length;

    // Add text segment before the card
    if (markerStart > lastIndex) {
      const textContent = content.substring(lastIndex, markerStart).trim();
      if (textContent) {
        segments.push({
          type: 'text',
          content: textContent,
        });
      }
    }

    // Parse and add card segment
    try {
      const data = JSON.parse(jsonResult.json);
      const card: Card = {
        type: cardType as Card['type'],
        data,
      };

      segments.push({
        type: 'card',
        card,
      });
    } catch (error) {
      // If JSON parsing fails, treat it as text
      console.error('Failed to parse card JSON:', error);
      const fullMatch = content.substring(markerStart, fullMatchEnd);
      segments.push({
        type: 'text',
        content: fullMatch,
      });
    }

    lastIndex = fullMatchEnd;
    searchIndex = fullMatchEnd;
  }

  // Add remaining text after the last card
  if (lastIndex < content.length) {
    const textContent = content.substring(lastIndex).trim();
    if (textContent) {
      segments.push({
        type: 'text',
        content: textContent,
      });
    }
  }

  // If no cards were found, return the entire content as text
  if (segments.length === 0 && content.trim()) {
    segments.push({
      type: 'text',
      content: content.trim(),
    });
  }

  return segments;
}

export function stripCardMarkers(content: string): string {
  const segments = parseMessageContent(content);
  return segments
    .filter(s => s.type === 'text')
    .map(s => s.content)
    .join(' ')
    .trim();
}

export function hasCards(content: string): boolean {
  return content.includes(CARD_PREFIX);
}
