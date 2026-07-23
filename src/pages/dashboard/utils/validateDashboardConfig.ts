export interface DashboardConfigValidationResult {
  valid: boolean;
  errors: string[];
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function checkNumber(value: unknown, path: string, errors: string[]) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    errors.push(`${path} must be a number`);
  }
}

function checkNonEmptyString(value: unknown, path: string, errors: string[]) {
  if (typeof value !== 'string' || value.length === 0) {
    errors.push(`${path} must be a non-empty string`);
  }
}

function validateLayout(layout: unknown, panelPath: string, panelId: unknown, errors: string[]) {
  const layoutPath = `${panelPath}.layout`;
  if (!isPlainObject(layout)) {
    errors.push(`${layoutPath} must be an object`);
    return;
  }

  checkNumber(layout.h, `${layoutPath}.h`, errors);
  checkNumber(layout.w, `${layoutPath}.w`, errors);
  checkNumber(layout.x, `${layoutPath}.x`, errors);
  checkNumber(layout.y, `${layoutPath}.y`, errors);
  checkNonEmptyString(layout.i, `${layoutPath}.i`, errors);

  if (typeof panelId === 'string' && typeof layout.i === 'string' && layout.i !== panelId) {
    errors.push(`${layoutPath}.i should equal ${panelPath}.id`);
  }
}

function validatePanel(panel: unknown, path: string, errors: string[]) {
  if (!isPlainObject(panel)) {
    errors.push(`${path} must be an object`);
    return;
  }

  checkNonEmptyString(panel.id, `${path}.id`, errors);
  checkNonEmptyString(panel.type, `${path}.type`, errors);
  validateLayout(panel.layout, path, panel.id, errors);

  if (panel.type === 'row') {
    if (panel.panels !== undefined) {
      if (!Array.isArray(panel.panels)) {
        errors.push(`${path}.panels must be an array`);
      } else {
        panel.panels.forEach((childPanel, index) => {
          validatePanel(childPanel, `${path}.panels[${index}]`, errors);
        });
      }
    }
    return;
  }
}

function validateVariables(variables: unknown, errors: string[]) {
  if (variables === undefined) {
    return;
  }
  if (!Array.isArray(variables)) {
    errors.push('configs.var must be an array');
    return;
  }

  variables.forEach((variable, index) => {
    const variablePath = `configs.var[${index}]`;
    if (!isPlainObject(variable)) {
      errors.push(`${variablePath} must be an object`);
      return;
    }
    checkNonEmptyString(variable.name, `${variablePath}.name`, errors);
    checkNonEmptyString(variable.type, `${variablePath}.type`, errors);
  });
}

function validateDashboardConfigInner(configs: unknown): DashboardConfigValidationResult {
  const errors: string[] = [];

  if (!isPlainObject(configs)) {
    errors.push('configs must be an object');
    return {
      valid: false,
      errors,
    };
  }

  validateVariables(configs.var, errors);
  if (configs.panels === undefined) {
    return {
      valid: errors.length === 0,
      errors,
    };
  }
  if (!Array.isArray(configs.panels)) {
    errors.push('configs.panels must be an array');
  } else {
    configs.panels.forEach((panel, index) => {
      validatePanel(panel, `configs.panels[${index}]`, errors);
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateDashboardConfig(configs: unknown): DashboardConfigValidationResult {
  try {
    return validateDashboardConfigInner(configs);
  } catch (error) {
    console.warn('Dashboard panels/variables config validator failed:', error);
    return {
      valid: false,
      errors: ['Dashboard panels/variables config validator failed'],
    };
  }
}
