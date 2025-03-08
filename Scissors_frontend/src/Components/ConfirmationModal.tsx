const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }:any) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg max-w-md">
          <h3 className="text-lg font-bold mb-4">{title}</h3>
          <p className="mb-6">{message}</p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };

  export default ConfirmationModal