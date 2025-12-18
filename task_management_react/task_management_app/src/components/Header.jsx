function Header({ title }) {
  return (
    <header className="bg-blue-700 text-white p-4 shadow-md">
      <h1 className="text-2xl font-bold">{title}</h1>
    </header>
  );
}

export default Header;
