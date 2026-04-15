function Clientes() {
  return (
    <div>
      <h2>Clientes</h2>
      <button>Cadastrar Cliente</button>

      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Cliente Exemplo</td>
            <td>Ativo</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Clientes;