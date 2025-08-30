/** @type {import('eslint').Rule.RuleModule} */
const noBadAccentUsage = {
  meta: {
    type: 'problem',
    docs: { description: 'Forbid raw #02FCFD and accent misuse' },
    schema: [],
    messages: {
      rawHex: 'Raw #02FCFD is forbidden. Use CSS var --color-accent only in allowed contexts.',
      bgBtn: 'Accent token/word cannot be used for backgrounds or buttons.'
    }
  },
  create(context) {
    return {
      Literal(node) {
        if (typeof node.value === 'string' && node.value.includes('#02FCFD')) {
          context.report({ node, messageId: 'rawHex' });
        }
      },
      JSXAttribute(node) {
        try {
          if (node.name && node.name.name === 'className' && node.value && node.value.type === 'Literal') {
            const val = String(node.value.value || '');
            if (/\b(bg|btn)[-:=[\(\s]*[^\n]*(accent|--color-accent)\b/i.test(val)) {
              context.report({ node, messageId: 'bgBtn' });
            }
          }
        } catch {}
      }
    };
  }
};

module.exports = {
  rules: {
    'no-bad-accent-usage': noBadAccentUsage
  }
};

