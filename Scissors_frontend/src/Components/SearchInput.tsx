interface searchInpputProps{
    value:string,
    onChange:(value:string)=>void
    placeholder?:string
}

const SearchInput = ({ value, onChange, placeholder }:searchInpputProps) => {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full max-w-md px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    );
  };

  export default SearchInput