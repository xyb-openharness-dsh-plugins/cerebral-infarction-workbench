/* 唯一面板布局合同；client 由 scripts/build-client.mjs 注入。 */
export const PANEL = Object.freeze({ customFrame: true, businessSide: 'left', businessWidth: 0.65 })
export const AGENT_PANE = Object.freeze({ min: 0.25, max: 0.45, default: 0.35, step: 0.02 })
export const UI_ENTRY = '/api/cerebral-infarction-workbench/ui/'
