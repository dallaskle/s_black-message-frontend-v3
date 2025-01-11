import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface DropdownProps {
  children: React.ReactNode;
  trigger: React.ReactNode;
  className?: string;
}

interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const DropdownMenu = ({ children, trigger, className = '' }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX
      });
    }
  }, [isOpen]);

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block">
      <div 
        ref={triggerRef} 
        onClick={handleTriggerClick}
        role="button"
        tabIndex={0}
        className="cursor-pointer"
      >
        {trigger}
      </div>
      {isOpen && createPortal(
        <div
          ref={menuRef}
          className={`fixed z-50 min-w-[8rem] py-1 bg-background-primary border border-text-secondary/10 rounded-md shadow-lg ${className}`}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          {children}
        </div>,
        document.body
      )}
    </div>
  );
};

const DropdownMenuItem = ({ children, onClick, className = '' }: DropdownItemProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full px-4 py-2 text-left text-sm hover:bg-background-secondary transition-colors ${className}`}
    >
      {children}
    </button>
  );
};

export {
  DropdownMenu,
  DropdownMenuItem,
}; 