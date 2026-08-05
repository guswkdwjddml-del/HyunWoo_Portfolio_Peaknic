import React, { useRef } from "react";

const FileUpload = ({
  files,
  setFiles,

  previewUrls,
  setPreviewUrls,

  oldFileNames = [],
  setOldFileNames = () => {},

  newFileNames = [],
  setNewFileNames = () => {},

  deletedFileNames = [],
  setDeletedFileNames = () => {},
}) => {
  const fileInputRef = useRef();

  // 신규 파일 선택
  const fileChangeFn = (e) => {
    const selectedFiles = Array.from(e.target.files);

    // 최대 5개 제한
    if (selectedFiles.length + files.length + oldFileNames.length > 5) {
      alert("최대 5장까지 가능합니다.");
      return;
    }

    setFiles((prev) => [...prev, ...selectedFiles]);

    const urls = selectedFiles.map((file) => URL.createObjectURL(file));

    setPreviewUrls((prev) => [...prev, ...urls]);
  };

  // 신규 파일 삭제
  const removeImage = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));

    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);

      return prev.filter((_, i) => i !== index);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 기존 파일 삭제
  const removeOldImage = (index) => {
    const deleteFileName = newFileNames[index];

    setDeletedFileNames((prev) => [...prev, deleteFileName]);

    setOldFileNames((prev) => prev.filter((_, i) => i !== index));

    setNewFileNames((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      {/* 기존 파일 */}
      {oldFileNames.length > 0 && (
        <div className="fileBox">
          <h4>현재 등록된 파일</h4>

          <div className="fileList">
            {oldFileNames.map((file, index) => (
              <div key={index} className="fileItem">
                📄 {file}
                <button
                  type="button"
                  className="fileDelBtn"
                  onClick={() => removeOldImage(index)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 파일 선택 */}
      <div className="inputBox">
        <label>첨부파일</label>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={fileChangeFn}
        />
      </div>

      {/* 선택 파일 */}
      {files.length > 0 && (
        <div className="fileBox">
          <h4>선택한 파일 ({files.length}/5)</h4>

          <div className="fileList">
            {files.map((file, index) => (
              <div key={index} className="fileItem">
                📄 {file.name}
                <button
                  type="button"
                  className="fileDelBtn"
                  onClick={() => removeImage(index)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 미리보기 */}
      {previewUrls.length > 0 && (
        <div className="previewBox">
          <h4>첨부 이미지</h4>

          <div className="previewList">
            {previewUrls.map((url, index) => (
              <div key={index} className="previewItem">
                <button
                  type="button"
                  className="fileDelBtn"
                  onClick={() => removeImage(index)}
                >
                  ✕
                </button>

                <img src={url} alt="" />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default FileUpload;
