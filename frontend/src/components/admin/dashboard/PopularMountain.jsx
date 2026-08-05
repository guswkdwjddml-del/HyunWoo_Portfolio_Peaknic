import React from 'react'

const PopularMountain = ({ data }) => {

  return (
    <div className="dashboardWidget popularMountain">

      <h3>인기산 Top5</h3>

      <div className="mountainTableWrap">
        <table className="mountainTable">
          <thead>
            <tr>
              <th>순위</th>
              <th>산이름</th>
              <th>지역</th>
              <th>북마크</th>
            </tr>
          </thead>

          <tbody>
            {data?.map((mountain, index) => {
              const rank = index + 1;
              const topClass = rank <= 3 ? `top${rank}` : '';

              return (
                <tr key={mountain.id}>
                  <td>
                    <span className={`rank-badge ${topClass}`}>
                      {rank}
                    </span>
                  </td>
                  <td>
                    <strong>{mountain.mountainName}</strong>
                  </td>
                  <td>
                    {mountain.sido} {mountain.sigungu}
                  </td>
                  <td>
                    <span className="bookmark-count">{mountain.bookmarkCount}</span>명
                  </td>
                </tr>
              )
            })}
          </tbody>

        </table>
      </div>
    </div>
  )
}

export default PopularMountain
