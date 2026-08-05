import React from 'react'

const AdminSearchBar = ({
  searchFields,
  sortFields,

  subject,
  setSubject,

  searchText,
  setSearchText,

  sort,
  setSort,

  onSearch
}) => {

  const currentField = searchFields?.find(
    (field) => field.value === subject
  );

  return (

    <div className="admin-search-area">
      <form
        className="list-search"
        onSubmit={(e) => {
          e.preventDefault();
          onSearch();
        }}
      >

        <select
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value);
            setSearchText("");
          }}
        >

          {
            searchFields?.map((field) => (
              <option
                key={field.value}
                value={field.value}
              >
                {field.label}
              </option>
            ))
          }

        </select>

        {/* <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="검색어를 입력하세요"
        /> */}
        {currentField?.type === "select" ? (

          <select
            className="search-value-select"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          >
            {currentField.options.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>

        ) : (

          <input
            className="search-value-input"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

        )}
        <button>검색</button>

      </form>


      <div className="toolbar-right">
        <label>
          정렬:
        </label>

        <select
          className="sort-select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          {
            sortFields?.map((field) => (
              <option
                key={field.value}
                value={field.value}
              >
                {field.label}
              </option>
            ))
          }
        </select>
      </div>

    </div>
  )
}

export default AdminSearchBar