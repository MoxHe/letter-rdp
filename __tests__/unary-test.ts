const unaryTest = (test: Function) => {
  test(
    `-x;`,
    {
      type: 'Program',
      body: [
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'UnaryExpression',
            operator: '-',
            argument: {
              type: 'Identifier',
              name: 'x',
            },
          },
        },
      ],
    }
  );

  test(
    `!x;`,
    {
      type: 'Program',
      body: [
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'UnaryExpression',
            operator: '!',
            argument: {
              type: 'Identifier',
              name: 'x',
            },
          },
        },
      ],
    }
  );
};

export default unaryTest;
