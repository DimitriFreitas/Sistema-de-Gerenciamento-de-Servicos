function Produtos() {
  return (
    <div>
      <h2>Produtos</h2>
      <button>Cadastrar Produto</button>

      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Estoque</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Produto Exemplo</td>
            <td>10</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Produtos;