import { PiCopy, PiCpu, PiCpuFill } from "react-icons/pi";
import { MdOutlineSmartDisplay } from "react-icons/md";

export default function PlayStatusIcon({ videoDecision, audioDecision, transcodeDecision, opacity }) {
  let videoDecisionToUse = videoDecision
  let audioDecisionToUse = audioDecision
  if (videoDecisionToUse === '') {
    videoDecisionToUse = transcodeDecision
  }
  if (audioDecisionToUse === '') {
    audioDecisionToUse = transcodeDecision
  }

  return (
    <div className="self-center text-base flex z-10">
      {videoDecisionToUse === "direct play" && audioDecisionToUse === "direct play" && (
        <MdOutlineSmartDisplay className={opacity} />
      )}
      {videoDecisionToUse === "copy" && audioDecisionToUse === "copy" && <PiCopy className={opacity} />}
      {videoDecisionToUse !== "copy" && videoDecisionToUse !== "direct play" && <PiCpuFill className={opacity} />}
      {(videoDecisionToUse === "copy" || videoDecisionToUse === "direct play") &&
       (audioDecisionToUse !== "copy" && audioDecisionToUse !== "direct play") && <PiCpu className={opacity} />}
    </div>
  );
}
