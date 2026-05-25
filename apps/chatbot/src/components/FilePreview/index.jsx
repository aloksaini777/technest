import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import ChatAudio from "./ChatAudio";


const FilePreview = ({
  fileType,
  fileUrl,
  fileName,
  onImageClick,
  text,
  sender,
}) => {
  if (!fileType || !fileUrl) return null;

  const fullUrl = fileUrl;

  return (
    <div
      className={`file-preview-wrapper ${
        sender === "User" ? "user" : "bot"
      }`}
    >
      {/* IMAGE PREVIEW */}
      {fileType.startsWith("image") && (
        <img
          src={fullUrl}
          alt={fileName || "image"}
          onClick={() => onImageClick?.(fullUrl)}
          className="file-preview-image"
        />
      )}

      {/* VIDEO PREVIEW */}
      {fileType.startsWith("video") && (
        <video
          src={fullUrl}
          controls
          className="file-preview-video"
        />
      )}

      {/* AUDIO PREVIEW */}
      {fileType.startsWith("audio") && <ChatAudio src={fullUrl} />}

      {/* PDF PREVIEW */}
      {fileType === "application/pdf" && (
        <a href={fullUrl} target="_blank" rel="noopener noreferrer">
          <div className="file-preview-pdf-wrapper">
            <embed src={fullUrl} type="application/pdf" />
          </div>

          <div className="file-preview-pdf-info">
            <FontAwesomeIcon icon={faFilePdf} />
            {/* <i className="fa-solid fa-file-pdf"></i> */}
            <span>{fileName}</span>
          </div>
        </a>
      )}

      {/* OTHER FILE TYPES */}
      {!fileType.startsWith("image") &&
        !fileType.startsWith("video") &&
        !fileType.startsWith("audio") &&
        fileType !== "application/pdf" && (
          <a
            href={fullUrl}
            download={fileName}
            className="file-download-link"
          >
            Download {fileName || "file"}
          </a>
        )}

      {/* TEXT ON TOP */}
      {text?.trim() && (
        <p className="file-preview-text">{text}</p>
      )}
    </div>
  );
};

export default FilePreview;
