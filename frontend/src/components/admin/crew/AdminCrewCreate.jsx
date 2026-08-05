import React from 'react'
import CrewCreate from '../../crew/create/CrewCreate'

const AdminCrewCreate = ({ onClose }) => {
  return (
    <div className='adminCrewCreate'>
      <button
        type="button"
        onClick={onClose}
      >
        취소
      </button>
      <CrewCreate />
    </div>
  )
}

export default AdminCrewCreate
