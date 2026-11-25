import filteredFields, { filterOutBuiltinFields } from './filteredFields';

describe('victorialogs filteredFields', () => {
  it('keeps _msg visible and sorts it first', () => {
    expect(filteredFields(['_time', '_msg', '_stream', '_stream_id', 'status'])).toEqual(['_msg', 'status']);
  });

  it('still hides the other builtin fields', () => {
    expect(filterOutBuiltinFields(['_time', '_msg', '_stream', '_stream_id'])).toEqual(['_msg']);
  });

  it('keeps _msg first when organizeFields is provided', () => {
    expect(filteredFields(['_msg', 'a', 'b'], ['b', '_msg', 'a'])).toEqual(['_msg', 'b', 'a']);
  });
});
