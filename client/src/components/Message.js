import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { User, Bot } from 'lucide-react';

const Message = ({ message, isStreaming = false }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 p-4 ${isUser ? 'bg-white' : 'bg-gray-50'}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-primary-600' : 'bg-gray-600'
        }`}>
          {isUser ? (
            <User className="h-4 w-4 text-white" />
          ) : (
            <Bot className="h-4 w-4 text-white" />
          )}
        </div>
      </div>

      {/* Message content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-900">
            {isUser ? 'You' : 'Gemini AI'}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
        
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={tomorrow}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
              p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-6 mb-3">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-6 mb-3">{children}</ol>,
              li: ({ children }) => <li className="mb-1">{children}</li>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary-500 pl-4 italic text-gray-700 mb-3">
                  {children}
                </blockquote>
              ),
              h1: ({ children }) => <h1 className="text-2xl font-bold mb-3">{children}</h1>,
              h2: ({ children }) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
              h3: ({ children }) => <h3 className="text-lg font-bold mb-3">{children}</h3>,
              h4: ({ children }) => <h4 className="text-base font-bold mb-3">{children}</h4>,
              h5: ({ children }) => <h5 className="text-sm font-bold mb-3">{children}</h5>,
              h6: ({ children }) => <h6 className="text-xs font-bold mb-3">{children}</h6>,
            }}
          >
            {message.content}
          </ReactMarkdown>
          
          {isStreaming && (
            <div className="typing-indicator mt-2">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message; 