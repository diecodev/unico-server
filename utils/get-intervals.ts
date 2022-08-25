export const getIntervals = (increment = true) => {
  const date = new Date();
  const new_date = date.toLocaleString('en-US', {
    timeZone: 'America/Argentina/Buenos_Aires',
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const asc_or_desc = date.getDate() + (increment ? 7 : -7);

  const date_two = new Date(date.setDate(asc_or_desc));
  const new_last_date = date_two.toLocaleString('en-US', {
    timeZone: 'America/Argentina/Buenos_Aires',
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const new_date_array = new_date.split(',')[0].split('/');
  const valid_new_date = new_date_array[2] + '-' + new_date_array[0] + '-' + new_date_array[1] + 'T00:00:00.000Z';

  const new_last_date_array = new_last_date.split(',')[0].split('/')
  const valid_new_last_date = new_last_date_array[2] + '-' + new_last_date_array[0] + '-' + new_last_date_array[1] + 'T00:00:00.000Z';

  const first_date = new Date(valid_new_date);
  const last_date = new Date(valid_new_last_date);

  return { first_date, last_date }
}