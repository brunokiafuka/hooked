/**
 * Colors used to fill hooks in the graph
 */
export const DEPTH_COLORS = {
  0: "#FFDDC1",
  1: "#DDBBFF",
  2: "#BBDDFF",
  3: "#C1FFC1",
  4: "#1D9D73",
  5: "#FF1D1D",
  6: "#C1C455",
  7: "#C13D3D",
  8: "#E6E6E6",
  9: "#909090",
  10: "#F4F4F4",
};

/**
 * Default hooks that are accepted in the project
 */
export const DEFAULT_ACCEPTED_HOOKS = [
  "useState",
  "useEffect",
  "useRef",
  "useCallback",
  "useMemo",
  "useContext",
  "useReducer",
  "useLayoutEffect",
  "useDebugValue",
  "useImperativeHandle",
  "useDeferredValue",
  "useTransition",
  "useId",
];

/**
 * Directories that are not considered screens
 */
export const NON_SCREEN_DIRS = ["hooks", "components"];
