interface PerformanceMetricsProps {
  positionsEvaluated: number;
  thinkingTime: number;
  difficulty: "easy" | "hard";
}

function PerformanceMetrics({
  positionsEvaluated,
  thinkingTime,
  difficulty,
}: PerformanceMetricsProps) {
  return (
    // max-w-md Medium maximum width constraint won't grow wider than this, even if parent is larger
    <div className="bg-gray-100 rounded-lg p-4 mb-6 max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-2 text-gray-800">
        AI Performance Metrics
      </h3>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Difficulty:</span>{" "}
          <span
            className={`font-semibold ${
              difficulty === "hard" ? "text-red-600" : "text-green-600"
            }`}
          >
            {difficulty === "hard" ? "Hard (Unbeatable)" : "Easy (Beatable)"}
          </span>
        </div>

        {/* {difficulty === "hard" && positionsEvaluated > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Positions Evaluated:</span>
            <span className="font-semibold text-gray-800">
              {positionsEvaluated.toLocaleString()}
            </span>
          </div>
        )} */}

        {thinkingTime > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Thinking Time:</span>
            <span className="font-semibold text-gray-800">
              {thinkingTime.toFixed(2)} ms
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default PerformanceMetrics;
