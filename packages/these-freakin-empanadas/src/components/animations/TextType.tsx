"use client";

import React, { createElement, useEffect, useMemo, useRef, useState } from "react";

type ElementTag = keyof JSX.IntrinsicElements;

export interface TextTypeProps extends React.HTMLAttributes<HTMLElement> {
  text: string | string[];
  as?: ElementTag;
  typingSpeed?: number;
  initialDelay?: number;
  pauseDuration?: number; // between items (when looping)
  deletingSpeed?: number;
  loop?: boolean;
  showCursor?: boolean;
  hideCursorWhileTyping?: boolean;
  cursorCharacter?: string;
  textColors?: string[]; // optional cycle per text item
}

export const TextType: React.FC<TextTypeProps> = ({
  text,
  as = "div",
  typingSpeed = 50,
  initialDelay = 0,
  pauseDuration = 2000,
  deletingSpeed = 30,
  loop = false,
  className = "",
  showCursor = true,
  hideCursorWhileTyping = false,
  cursorCharacter = "|",
  textColors = [],
  ...props
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const textArray = useMemo(() => (Array.isArray(text) ? text : [text]), [text]);

  useEffect(() => {
    // simple cursor blink without external deps
    if (!showCursor) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => setCursorVisible((v) => !v), 500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [showCursor]);

  useEffect(() => {
    const currentText = textArray[currentTextIndex] ?? "";
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const tick = () => {
      if (isDeleting) {
        if (displayedText.length === 0) {
          setIsDeleting(false);
          if (currentTextIndex === textArray.length - 1 && !loop) {
            return; // finished
          }
          setCurrentTextIndex((i) => (i + 1) % textArray.length);
          setCurrentCharIndex(0);
          timeoutRef.current = setTimeout(() => {}, pauseDuration);
        } else {
          timeoutRef.current = setTimeout(() => {
            setDisplayedText((prev) => prev.slice(0, -1));
          }, deletingSpeed);
        }
      } else {
        if (currentCharIndex < currentText.length) {
          timeoutRef.current = setTimeout(() => {
            setDisplayedText((prev) => prev + currentText[currentCharIndex]);
            setCurrentCharIndex((c) => c + 1);
          }, typingSpeed);
        } else if (textArray.length > 1 && loop) {
          timeoutRef.current = setTimeout(() => setIsDeleting(true), pauseDuration);
        }
      }
    };

    if (currentCharIndex === 0 && !isDeleting && displayedText === "") {
      timeoutRef.current = setTimeout(tick, initialDelay);
    } else {
      tick();
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentCharIndex,
    displayedText,
    isDeleting,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    textArray,
    currentTextIndex,
    loop,
    initialDelay,
  ]);

  const hideCursor = hideCursorWhileTyping &&
    (currentCharIndex < (textArray[currentTextIndex] ?? "").length || isDeleting);

  const color = textColors.length ? textColors[currentTextIndex % textColors.length] : undefined;

  return createElement(
    as,
    {
      className: `text-type ${className}`.trim(),
      ...props,
    },
    <span className="text-type__content" style={{ color }}>{displayedText}</span>,
    showCursor && (
      <span
        className={`text-type__cursor${hideCursor ? " text-type__cursor--hidden" : ""}`}
        style={{ marginLeft: "0.25rem", display: "inline-block", opacity: cursorVisible ? 1 : 0 }}
      >
        {cursorCharacter}
      </span>
    )
  );
};

export default TextType;

