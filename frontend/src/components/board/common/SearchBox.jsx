import "../../../css/board/common/searchBox.css";
const SearchBox = ({
  options,
  subject,
  setSubject,
  searchText,
  setSearchText,
  setPage,
}) => {

  return (
    <div className="board-search">

      <select
        value={subject}
        onChange={(e) => {
          setSubject(e.target.value);
          setPage(0);
        }}
      >
        {options.map((item) => (
          <option 
            key={item.value} 
            value={item.value}
          >
            {item.label}
          </option>
        ))}
      </select>


      <input
        value={searchText}
        onChange={(e) => {
          setSearchText(e.target.value);
          setPage(0);
        }}
        placeholder="검색어 입력"
      />

    </div>
  );
};

export default SearchBox;