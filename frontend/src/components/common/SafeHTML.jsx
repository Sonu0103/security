import DOMPurify from "dompurify";

function SafeHTML({ html, className = "" }) {
  const sanitizedHTML = DOMPurify.sanitize(html);
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  );
}

export default SafeHTML;
