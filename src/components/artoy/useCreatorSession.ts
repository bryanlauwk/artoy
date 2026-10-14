import { useCallback, useEffect, useRef, useState } from "react";
export type ExpansionType = "product-views" | "packaging" | "series";
export const DETAIL_OPTIONS = [
  {
    id: "product-views",
    label: "Product Views",
    description: "Front, side and back of this design",
  },
  {
    id: "packaging",
    label: "Packaging Concept",
    description: "Presentation box, insert and story card",
  },
  { id: "series", label: "Collect the Series", description: "Three related themed editions" },
] as const;
export type Creation = {
  label: string;
  kind: "experience" | "merch";
  image: string | null;
  error?: string;
};
type Source = { image: string; name: string; sampleId: string | null };

export function useCreatorSession(initialFile?: File) {
  const [source, setSource] = useState<Source | null>(null);
  const [reading, setReading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<Creation[] | null>(null);
  const [details, setDetails] = useState<Record<string, Creation[]>>({});
  const [expanding, setExpanding] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [emailSaved, setEmailSaved] = useState(false);
  const request = useRef<AbortController | null>(null);
  const reader = useRef<FileReader | null>(null);

  const stopWork = useCallback(() => {
    request.current?.abort();
    request.current = null;
    reader.current?.abort();
    reader.current = null;
  }, []);
  useEffect(() => stopWork, [stopWork]);

  const chooseSource = useCallback(
    (next: Source) => {
      stopWork();
      setSource(next);
      setResults(null);
      setDetails({});
      setExpanding(null);
      setError("");
      setGenerating(false);
      setReading(false);
      setEmailSaved(false);
    },
    [stopWork],
  );

  const generateSource = useCallback(
    async (selectedSource: Source, detail?: { concept: Creation; expansion: ExpansionType }) => {
      if (request.current) return;
      const controller = new AbortController();
      request.current = controller;
      if (detail) setExpanding(`${detail.concept.label}:${detail.expansion}`);
      else setGenerating(true);
      setError("");
      try {
        let imageDataUrl = selectedSource.image;
        if (!imageDataUrl.startsWith("data:")) {
          const imageResponse = await fetch(imageDataUrl, { signal: controller.signal });
          if (!imageResponse.ok)
            throw new Error("We couldn’t load that sample. Please try another.");
          const blob = await imageResponse.blob();
          imageDataUrl = await new Promise<string>((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.onload = () => resolve(String(fileReader.result));
            fileReader.onerror = () => reject(new Error("We couldn’t read that sample."));
            fileReader.readAsDataURL(blob);
          });
        }
        if (controller.signal.aborted) return;
        const response = await fetch("/api/generate-universe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageDataUrl,
            mode: detail ? "detail" : "initial",
            ...(detail
              ? {
                  conceptLabel: detail.concept.label,
                  conceptImageDataUrl: detail.concept.image,
                  expansion: detail.expansion,
                }
              : {}),
          }),
          signal: controller.signal,
        });
        const json = (await response.json()) as { results?: Creation[] };
        if (!response.ok) {
          throw new Error(
              response.status === 402
              ? "Live generation is paused right now. Try one of the sample characters below, or leave your email and we’ll notify you when it’s back."
              : response.status === 429
                ? "The studio is busy. Please wait a moment and try again."
                : "We couldn’t generate your universe. Your artwork is still here—try again.",
          );
        }
        if (!Array.isArray(json.results) || !json.results.some((item) => item.image)) {
          throw new Error("No images were generated. Try again or choose different artwork.");
        }
        if (request.current === controller) {
          if (detail)
            setDetails((previous) => ({
              ...previous,
              [detail.concept.label]: [
                ...(previous[detail.concept.label] ?? []).filter(
                  (item) => item.label !== json.results![0].label,
                ),
                ...json.results!,
              ],
            }));
          else {
            setResults(json.results);
            setDetails({});
          }
        }
      } catch (cause) {
        if (!controller.signal.aborted && request.current === controller)
          setError(
            cause instanceof Error ? cause.message : "Something went wrong. Please try again.",
          );
      } finally {
        if (request.current === controller) {
          request.current = null;
          setGenerating(false);
          setExpanding(null);
        }
      }
    },
    [],
  );

  const uploadFile = useCallback(
    (file?: File, autoGenerate = false) => {
      if (!file) return;
      if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
        setError("Choose a PNG, JPG or WebP image.");
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        setError("Choose an image smaller than 8 MB.");
        return;
      }
      stopWork();
      setGenerating(false);
      setReading(true);
      setError("");
      const fileReader = new FileReader();
      reader.current = fileReader;
      fileReader.onload = () => {
        if (reader.current !== fileReader) return;
        const nextSource: Source = {
          image: String(fileReader.result),
          name: file.name.replace(/\.[^.]+$/, "").slice(0, 60),
          sampleId: null,
        };
        chooseSource(nextSource);
        if (autoGenerate) void generateSource(nextSource);
      };
      fileReader.onerror = () => {
        if (reader.current === fileReader) {
          setReading(false);
          setError("We couldn’t read that image. Please choose another.");
        }
      };
      fileReader.readAsDataURL(file);
    },
    [chooseSource, stopWork, generateSource],
  );

  useEffect(() => {
    if (initialFile) uploadFile(initialFile, true);
  }, [initialFile, uploadFile]);

  const generate = () => {
    if (source && !reading) return generateSource(source);
  };
  const chooseSample = (sample: { id: string; name: string; image: string; results: Creation[] }) => {
    stopWork();
    setSource({ image: sample.image, name: sample.name, sampleId: sample.id });
    setResults(sample.results);
    setDetails({});
    setExpanding(null);
    setError("");
    setGenerating(false);
    setReading(false);
    setEmailSaved(false);
  };
  const cancel = () => {
    stopWork();
    setGenerating(false);
    setExpanding(null);
    setReading(false);
  };
  const reset = () => {
    cancel();
    setSource(null);
    setDetails({});
    setExpanding(null);
    setResults(null);
    setError("");
    setEmailSaved(false);
  };
  return {
    source,
    reading,
    generating,
    results,
    details,
    expanding,
    expand: (concept: Creation, expansion: ExpansionType) => {
      if (source && concept.image) return generateSource(source, { concept, expansion });
    },
    error,
    emailSaved,
    setEmailSaved,
    setError,
    uploadFile,
    chooseSource,
    chooseSample,
    generate,
    cancel,
    reset,
  };
}
export type CreatorSession = ReturnType<typeof useCreatorSession>;
