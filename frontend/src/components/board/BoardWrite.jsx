import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import "../../css/board/boardWrite.css";
import FileUpload from "./common/FileUpload";
import "../../css/board/boardLayout.css";

const BoardWrite = () => {
  const navigate = useNavigate();

  const { search } = useLocation();

  const { id } = useParams();

  const category = new URLSearchParams(search).get("category");


  const isUpdate = id !== undefined;

  const [files, setFiles] = useState([]);

  const [previewUrls, setPreviewUrls] = useState([]);

  const [board, setBoard] = useState({
    title: "",
    content: "",
    category: "",
    oldFileNames: [],
    newFileNames: [],
  });
  const [deletedFileNames, setDeletedFileNames] = useState([]);

  // 수정 데이터 조회

  useEffect(() => {
    if (!isUpdate) {
      return;
    }

    axios
      .get(`/api/board/${id}`)
      .then((res) => {
        setBoard(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [id]);

  const changeFn = (e) => {
    setBoard({
      ...board,

      [e.target.name]: e.target.value,
    });
  };

  const submitFn = () => {

     if (!board.title.trim()) {
    alert("제목을 입력해주세요.");
    return;
  }

  if (!board.content.trim()) {
    alert("내용을 입력해주세요.");
    return;
  }
    const formData = new FormData();

    formData.append("title", board.title);

    formData.append("content", board.content);

    formData.append(
      "category",
      category ? category.toUpperCase() : board.category,
    );

    files.forEach((file) => {
      formData.append("boardFiles", file);
    });

    deletedFileNames.forEach((fileName) => {
      formData.append("deletedFileNames", fileName);
    });

    const url = isUpdate
      ? `/api/board/${id}`
      : `/api/board/save`;

    const method = isUpdate ? axios.put : axios.post;

    method(url, formData)
      .then(() => {
        alert(isUpdate ? "수정 완료" : "게시글 등록 완료");

        navigate(`/board/${category ?? board.category.toLowerCase()}`);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="boardWrite">
      <div className="boardWrite-con">
        <h2>{isUpdate ? "게시글 수정" : "게시글 등록"}</h2>

        <div className="inputBox">
          <label>제목</label>

          <input name="title" value={board.title} onChange={changeFn} />
        </div>

        <div className="inputBox">
          <label>내용</label>

          <textarea name="content" value={board.content} onChange={changeFn} />
        </div>

        <FileUpload
          files={files}
          setFiles={setFiles}
          previewUrls={previewUrls}
          setPreviewUrls={setPreviewUrls}
          oldFileNames={board.oldFileNames}
          newFileNames={board.newFileNames}
          setOldFileNames={(value) =>
            setBoard((prev) => ({
              ...prev,
              oldFileNames:
                typeof value === "function" ? value(prev.oldFileNames) : value,
            }))
          }
          setNewFileNames={(value) =>
            setBoard((prev) => ({
              ...prev,
              newFileNames:
                typeof value === "function" ? value(prev.newFileNames) : value,
            }))
          }
          deletedFileNames={deletedFileNames}
          setDeletedFileNames={setDeletedFileNames}
        />
      <div className="btnArea">
        <button onClick={submitFn}>
          {isUpdate ? "수정 완료" : "게시글 등록"}
        </button>
      </div>
      </div>
    </div>
  );
};

export default BoardWrite;
