import filteredFields, { filterOutBuiltinFields } from './filteredFields';

describe('victorialogs filteredFields', () => {
  it('keeps _msg visible without reordering visible fields', () => {
    // Field order comes from the data / the draggable "display fields" settings,
    // so _msg must not be moved to the front here.
    expect(filteredFields(['status', '_time', '_msg', '_stream', '_stream_id'])).toEqual(['status', '_msg']);
  });

  it('still hides the other builtin fields', () => {
    expect(filterOutBuiltinFields(['_time', '_msg', '_stream', '_stream_id'])).toEqual(['_msg']);
  });

  it('respects the order configured in the display-field settings', () => {
    expect(filteredFields(['_msg', 'a', 'b'], ['b', '_msg', 'a'])).toEqual(['b', '_msg', 'a']);
  });
});
