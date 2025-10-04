import React from "react";

export interface UseSidebarResizeProps {
  currentWidth: string;
  isCollapsed?: boolean;
  onResize: (width: string) => void;
  minResizeWidth?: string;
  maxResizeWidth?: string;
  setIsDraggingRail?: (isDragging: boolean) => void;
  widthCookieName?: string;
  widthCookieMaxAge?: number;
}

interface WidthUnit {
  value: number;
  unit: "px";
}

function parseWidth(width: string): WidthUnit {
  const unit = "px";
  const value = Number.parseFloat(width);
  return { value, unit };
}

function formatWidth(value: number, unit: "px"): string {
  return `${Math.round(value)}${unit}`;
}

export function useSidebarResize({
  currentWidth,
  onResize,
  isCollapsed = false,
  minResizeWidth = "256px",
  maxResizeWidth = "864px",
  setIsDraggingRail = () => { },
  widthCookieName,
  widthCookieMaxAge = 60 * 60 * 24 * 7, // 1 week default
}: UseSidebarResizeProps) {
  const startWidth = React.useRef(0);
  const startX = React.useRef(0);
  const isDragging = React.useRef(false);
  const isInteractingWithRail = React.useRef(false);
  const lastWidth = React.useRef(0);
  const lastLoggedWidth = React.useRef(0);
  const dragStartPoint = React.useRef(0);
  const lastDragDirection = React.useRef<"expand" | "collapse" | null>(null);
  const lastTogglePoint = React.useRef(0);
  const lastToggleWidth = React.useRef(0);
  const toggleCooldown = React.useRef(false);
  const lastToggleTime = React.useRef(0);
  const dragDistanceFromToggle = React.useRef(0);
  const dragOffset = React.useRef(0);
  const railRect = React.useRef<DOMRect | null>(null);


  const minWidthPx = React.useMemo(
    () => parseWidth(minResizeWidth).value,
    [minResizeWidth],
  );
  const maxWidthPx = React.useMemo(
    () => parseWidth(maxResizeWidth).value,
    [maxResizeWidth],
  );

  const isIncreasingWidth = React.useCallback(
    (currentX: number, referenceX: number): boolean => currentX > referenceX,
    [],
  );

  const calculateWidth = React.useCallback(
    (e: MouseEvent,): number => e.clientX, [],
  );

  const persistWidth = React.useCallback(
    (width: string) => {
      if (widthCookieName) {
        document.cookie = `${widthCookieName}=${width}; path=/; max-age=${widthCookieMaxAge}`;
      }
    },
    [widthCookieName, widthCookieMaxAge],
  );

  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent) => {
      isInteractingWithRail.current = true;

      const currentWidthPx = isCollapsed ? 0 : parseWidth(currentWidth).value;
      startWidth.current = currentWidthPx;
      startX.current = e.clientX;
      dragStartPoint.current = e.clientX;
      lastWidth.current = currentWidthPx;
      lastLoggedWidth.current = currentWidthPx;
      lastTogglePoint.current = e.clientX;
      lastToggleWidth.current = currentWidthPx;
      lastDragDirection.current = null;
      toggleCooldown.current = false;
      lastToggleTime.current = 0;
      dragDistanceFromToggle.current = 0;
      dragOffset.current = 0;
      railRect.current = null;

      e.preventDefault();
    },
    [isCollapsed, currentWidth],
  );

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isInteractingWithRail.current) return;

      const deltaX = Math.abs(e.clientX - startX.current);
      if (!isDragging.current && deltaX > 5) {
        isDragging.current = true;
        setIsDraggingRail(true);
      }

      if (isDragging.current) {
        const { unit } = parseWidth(currentWidth);

        const currentDragDirection = isIncreasingWidth(
          e.clientX,
          lastTogglePoint.current,
        )
          ? "expand"
          : "collapse";

        // Update direction tracking
        if (lastDragDirection.current !== currentDragDirection) {
          lastDragDirection.current = currentDragDirection;
        }

        // Calculate distance from last toggle point
        dragDistanceFromToggle.current = Math.abs(
          e.clientX - lastTogglePoint.current,
        );

        // Check for toggle cooldown (prevent rapid toggling)
        const now = Date.now();
        if (toggleCooldown.current && now - lastToggleTime.current > 200) {
          toggleCooldown.current = false;
        }


        if (isCollapsed) return;

        const newWidthPx = calculateWidth(e);

        // Clamp width between min and max
        const clampedWidthPx = Math.max(
          minWidthPx,
          Math.min(maxWidthPx, newWidthPx),
        );

        const formattedWidth = formatWidth(clampedWidthPx, unit);
        onResize(formattedWidth);
        persistWidth(formattedWidth);

        // Update last width
        lastWidth.current = clampedWidthPx;
      }
    };

    const handleMouseUp = () => {
      if (!isInteractingWithRail.current) return;

      isDragging.current = false;
      isInteractingWithRail.current = false;
      lastWidth.current = 0;
      lastLoggedWidth.current = 0;
      lastDragDirection.current = null;
      lastTogglePoint.current = 0;
      lastToggleWidth.current = 0;
      toggleCooldown.current = false;
      lastToggleTime.current = 0;
      dragDistanceFromToggle.current = 0;
      dragOffset.current = 0;
      railRect.current = null;
      setIsDraggingRail(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    onResize,
    isCollapsed,
    currentWidth,
    persistWidth,
    setIsDraggingRail,
    minWidthPx,
    maxWidthPx,
    isIncreasingWidth,
    calculateWidth,
  ]);

  return {
    handleMouseDown,
  };
}
