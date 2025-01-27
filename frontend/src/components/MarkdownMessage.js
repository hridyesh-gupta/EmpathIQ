import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './MarkdownMessage.css';

const MarkdownMessage = ({ content }) => {
  return (
    <div className="markdown-message">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          h1: 'h3', // Downgrade headers to fit chat context
          h2: 'h4',
          h3: 'h5',
          code: ({ node, inline, className, children, ...props }) => {
            return inline ? (
              <code className="inline-code" {...props}>
                {children}
              </code>
            ) : (
              <pre className="code-block">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownMessage; 