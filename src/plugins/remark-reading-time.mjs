/**
 * Estimates reading time from the raw markdown, without pulling in a dependency.
 * Code fences and HTML comments are excluded — you skim those, you don't read them.
 */
export function remarkReadingTime() {
  return function (_tree, file) {
    const text = String(file.value)
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/[#*_>`|-]/g, ' ');

    const words = text.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(words / 200));

    file.data.astro.frontmatter.minutesRead = `${minutes} min read`;
  };
}
