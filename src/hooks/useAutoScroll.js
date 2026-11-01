import { useEffect } from "react";

function scrollIntoContainer(container, element) {
  const containerRect = container.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  const offset =
    elementRect.top -
    containerRect.top +
    container.scrollTop -
    (containerRect.height - elementRect.height) / 2;

  container.scrollTo({ top: offset, behavior: "smooth" });
}

export function useAutoScroll(currentIndex) {
  useEffect(() => {
    if (currentIndex === null) return;

    const element = document.getElementById(`line-${currentIndex}`);
    const container = document.querySelector("[data-subtitle-scroll]");
    if (!element || !container) return;

    scrollIntoContainer(container, element);
  }, [currentIndex]);
}
