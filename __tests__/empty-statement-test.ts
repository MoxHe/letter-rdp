const emptyStatementTest = (test: Function) => {
  test(
    `;`,
    {
      type: 'Program',
      body: [
        {
          type: 'EmptyStatement',
        },
      ],
    }
  );
};

export default emptyStatementTest;
