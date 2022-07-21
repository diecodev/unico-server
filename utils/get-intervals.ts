export const getIntervals = (increment = true) => {
  const date = new Date();
  const new_date = date.toLocaleString('en-US', {
    timeZone: 'America/Argentina/Buenos_Aires',
  });

  const asc_or_desc = date.getDate() + (increment ? 7 : -7);

  const date_two = new Date(date.setDate(asc_or_desc));
  const new_last_date = date_two.toLocaleString('en-US', {
    timeZone: 'America/Argentina/Buenos_Aires',
  });

  const valid_new_date = new_date.split(',')[0].replaceAll('/', '-');
  const valid_new_last_date = new_last_date.split(',')[0].replaceAll('/', '-');

  const first_date = new Date(valid_new_date);
  const last_date = new Date(valid_new_last_date);

  return { first_date, last_date }
}