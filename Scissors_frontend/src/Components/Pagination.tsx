
export interface paginationProps{
    currentPage:number,
    totalItems:number,
    itemsPerPage:number,
    onPageChange:(page:number)=>void
}

const Pagination = ({currentPage,totalItems,itemsPerPage,onPageChange}:paginationProps) => {
    const totalPages = Math.ceil(totalItems/itemsPerPage)
  return (
    <div>
        <div className='flex items-center justify-center'>
            <button
            onClick={()=>onPageChange(currentPage-1)}
            disabled = {currentPage==1}
            className="px-4 py-2 border rounded disabled:opacity-50"
            >
            Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 border rounded disabled:opacity-50"
      >
        Next
      </button>
        </div>
    </div>
  )
}

export default Pagination
