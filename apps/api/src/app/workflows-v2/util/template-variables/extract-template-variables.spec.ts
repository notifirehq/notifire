import { expect } from 'chai';
import { extractTemplateVars, extractLiquidExpressions } from './extract-template-variables';

describe('extractTemplateVars', () => {
  it('should extract simple variable names', () => {
    const template = '{{name}} {{age}}';
    const { validVariables: variables } = extractTemplateVars(template);

    expect(variables).to.have.members(['name', 'age']);
  });

  it('should extract nested object paths', () => {
    const template = 'Hello {{user.profile.name}}, your address is {{user.address.street}}';
    const { validVariables: variables } = extractTemplateVars(template);

    expect(variables).to.have.members(['user.profile.name', 'user.address.street']);
  });

  it('should handle multiple occurrences of the same variable', () => {
    const template = '{{user.name}} {{user.name}} {{user.name}}';
    const { validVariables: variables } = extractTemplateVars(template);

    expect(variables).to.have.members(['user.name']);
  });

  it('should handle mixed content with HTML and variables', () => {
    const template = '<div>Hello {{user.name}}</div><span>{{status}}</span>';
    const { validVariables: variables } = extractTemplateVars(template);

    expect(variables).to.have.members(['user.name', 'status']);
  });

  it('should handle whitespace in template syntax', () => {
    const template = '{{ user.name }} {{  status  }}';
    const { validVariables: variables } = extractTemplateVars(template);

    expect(variables).to.have.members(['user.name', 'status']);
  });

  it('should handle empty template string', () => {
    const template = '';
    const { validVariables: variables } = extractTemplateVars(template);

    expect(variables.length).to.equal(0);
  });

  it('should handle template with no variables', () => {
    const template = 'Hello World!';
    const { validVariables: variables } = extractTemplateVars(template);

    expect(variables).to.have.lengthOf(0);
  });

  it('should handle special characters in variable names', () => {
    const template = '{{special_var_1}} {{data-point}}';
    const { validVariables: variables } = extractTemplateVars(template);

    expect(variables).to.have.members(['special_var_1', 'data-point']);
  });

  it('should handle spaces after dot in variable names', () => {
    const template = '{{payload. withSpace  | upcase}}';
    const { validVariables: variables } = extractTemplateVars(template);

    expect(variables).to.have.members(['payload.withSpace']);
  });

  it('should extract variable names with spaces', () => {
    const template = '{{payload foo}}';
    const { validVariables: variables } = extractTemplateVars(template);

    expect(variables).to.have.members(['payload']);

    const template2 = '{{payload1 foo1}} {{payload2 foo2}}';
    const { validVariables: variables2 } = extractTemplateVars(template2);

    expect(variables2).to.have.members(['payload1', 'payload2']);
  });

  describe('Error handling', () => {
    it('should handle invalid liquid syntax gracefully', () => {
      const { validVariables: variables, invalidVariables: errors } = extractTemplateVars(
        '{{invalid..syntax}} {{invalid2..syntax}}'
      );

      expect(variables).to.have.lengthOf(0);
      expect(errors).to.have.lengthOf(2);
      expect(errors[0].message).to.contain('expected "|" before filter');
      expect(errors[0].variable).to.equal('{{invalid..syntax}}');
      expect(errors[1].variable).to.equal('{{invalid2..syntax}}');
    });

    it('should handle invalid liquid syntax gracefully, return valid variables', () => {
      const { validVariables, invalidVariables: errors } = extractTemplateVars(
        '{{subscriber.name}} {{invalid..syntax}}'
      );

      expect(validVariables).to.have.members(['subscriber.name']);
      expect(errors[0].message).to.contain('expected "|" before filter');
      expect(errors[0].variable).to.equal('{{invalid..syntax}}');
    });

    it('should handle undefined input gracefully', () => {
      expect(() => extractTemplateVars(undefined as any)).to.not.throw();
      expect(extractTemplateVars(undefined as any)).to.deep.equal({ validVariables: [], invalidVariables: [] });
    });

    it('should handle non-string input gracefully', () => {
      expect(() => extractTemplateVars({} as any)).to.not.throw();
      expect(extractTemplateVars({} as any)).to.deep.equal({ validVariables: [], invalidVariables: [] });
    });
  });
});

describe('extractLiquidExpressions', () => {
  it('should extract simple liquid expressions', () => {
    const template = '{{name}} {{age}}';
    const expressions = extractLiquidExpressions(template);

    expect(expressions).to.deep.equal(['{{name}}', '{{age}}']);
  });

  it('should handle expressions with filters', () => {
    const template = '{{name | upcase}} {{age | plus: 1}}';
    const expressions = extractLiquidExpressions(template);

    expect(expressions).to.deep.equal(['{{name | upcase}}', '{{age | plus: 1}}']);
  });

  it('should handle expressions with whitespace', () => {
    const template = '{{ name   }} {{   age    }}';
    const expressions = extractLiquidExpressions(template);

    expect(expressions).to.deep.equal(['{{ name   }}', '{{   age    }}']);
  });

  it('should handle expressions in HTML context', () => {
    const template = '<div>{{name}}</div><span>{{age}}</span>';
    const expressions = extractLiquidExpressions(template);

    expect(expressions).to.deep.equal(['{{name}}', '{{age}}']);
  });

  it('should return empty array for invalid inputs', () => {
    expect(extractLiquidExpressions('')).to.deep.equal([]);
    expect(extractLiquidExpressions(null as any)).to.deep.equal([]);
    expect(extractLiquidExpressions(undefined as any)).to.deep.equal([]);
    expect(extractLiquidExpressions('no expressions here')).to.deep.equal([]);
  });

  it('should handle expressions with nested properties', () => {
    const template = '{{user.name}} {{address.street.number}}';
    const expressions = extractLiquidExpressions(template);

    expect(expressions).to.deep.equal(['{{user.name}}', '{{address.street.number}}']);
  });
});
