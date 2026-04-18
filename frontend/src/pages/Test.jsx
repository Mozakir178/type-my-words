import { useState } from "react";
import { useParams } from "react-router-dom";
import { testService } from "../services/api";
import TypingEngine from "../components/typing/TypingEngine";
import {
  TEST_MODES,
  TIME_OPTIONS,
  WORD_OPTIONS,
  DIFFICULTIES,
} from "../utils/constants";
import Button from "../components/ui/Button";

const Test = () => {
  const { mode: paramMode } = useParams();
  const [config, setConfig] = useState({
    mode: paramMode || TEST_MODES.WORDS,
    duration: 30,
    wordCount: 25,
    difficulty: "medium",
    customText: "",
  });

  const handleComplete = async (results) => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        await testService.submitResult(results);
      } catch (err) {
        console.error("Failed to save test:", err);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex flex-wrap items-center justify-center gap-3 mb-8 p-4 bg-white dark:bg-gray-800 rounded-xl shadow">
        {Object.values(TEST_MODES).map((m) => (
          <Button
            key={m}
            variant={config.mode === m ? "primary" : "ghost"}
            onClick={() => setConfig({ ...config, mode: m })}
            className="capitalize"
          >
            {m}
          </Button>
        ))}
        <div className="w-px h-8 bg-gray-300 dark:bg-gray-600 mx-2" />
        {config.mode === TEST_MODES.TIME &&
          TIME_OPTIONS.map((t) => (
            <Button
              key={t}
              variant={config.duration === t ? "primary" : "ghost"}
              onClick={() => setConfig({ ...config, duration: t })}
            >
              {t}s
            </Button>
          ))}
        {config.mode === TEST_MODES.WORDS &&
          WORD_OPTIONS.map((w) => (
            <Button
              key={w}
              variant={config.wordCount === w ? "primary" : "ghost"}
              onClick={() => setConfig({ ...config, wordCount: w })}
            >
              {w}w
            </Button>
          ))}
        <div className="w-px h-8 bg-gray-300 dark:bg-gray-600 mx-2" />
        {DIFFICULTIES.map((d) => (
          <Button
            key={d}
            variant={config.difficulty === d ? "primary" : "ghost"}
            onClick={() => setConfig({ ...config, difficulty: d })}
            className="capitalize"
          >
            {d}
          </Button>
        ))}
      </div>

      <TypingEngine config={config} onComplete={handleComplete} />

      {config.mode === TEST_MODES.CUSTOM && (
        <textarea
          className="w-full mt-4 p-4 border rounded-lg bg-transparent h-32 resize-none"
          placeholder="Paste custom text here..."
          value={config.customText}
          onChange={(e) => setConfig({ ...config, customText: e.target.value })}
        />
      )}
    </div>
  );
};

export default Test;
