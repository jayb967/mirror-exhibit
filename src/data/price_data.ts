

interface DataType {
  delay: string;
  title: string;
  price: string;
  feature_data: {
    icon: string;
    feature: string;
  }[];
}



const price_data: DataType[] = [
  {
    delay: ".3s",
    title: "Stater  Plan",
    price: "19",
    feature_data: [
      { icon: 'fa-square-check', feature: 'Mistakes To Avoid' },
      { icon: 'fa-square-check', feature: 'Your Startup' },
      { icon: 'fa-circle-xmark', feature: 'Knew About Fonts' },
      { icon: 'fa-circle-xmark', feature: 'Winning Metric for Your Startup' },
      { icon: 'fa-circle-xmark', feature: 'Your Startup' },
    ]
  },
  {
    delay: ".5s",
    title: "Basic Plan",
    price: "29",
    feature_data: [
      { icon: 'fa-square-check', feature: 'Mistakes To Avoid' },
      { icon: 'fa-square-check', feature: 'Your Startup' },
      { icon: 'fa-square-check', feature: 'Knew About Fonts' },
      { icon: 'fa-square-check', feature: 'Winning Metric for Your Startup' },
      { icon: 'fa-circle-xmark', feature: 'Your Startup' },
    ]
  },
  {
    delay: ".6s",
    title: "Premium Plan",
    price: "49",
    feature_data: [
      { icon: 'fa-square-check', feature: 'Mistakes To Avoid' },
      { icon: 'fa-square-check', feature: 'Your Startup' },
      { icon: 'fa-square-check', feature: 'Knew About Fonts' },
      { icon: 'fa-square-check', feature: 'Winning Metric for Your Startup' },
      { icon: 'fa-square-check', feature: 'Your Startup' },
    ]
  },
  // 

  {
    delay: ".7s",
    title: "Elite Plan",
    price: "59",
    feature_data: [
      { icon: 'fa-square-check', feature: 'Mistakes To Avoid' },
      { icon: 'fa-square-check', feature: 'Your Startup' },
      { icon: 'fa-circle-xmark', feature: 'Knew About Fonts' },
      { icon: 'fa-circle-xmark', feature: 'Winning Metric for Your Startup' },
      { icon: 'fa-circle-xmark', feature: 'Your Startup' },
    ]
  },
  {
    delay: ".8s",
    title: "Gold Plan",
    price: "69",
    feature_data: [
      { icon: 'fa-square-check', feature: 'Mistakes To Avoid' },
      { icon: 'fa-square-check', feature: 'Your Startup' },
      { icon: 'fa-square-check', feature: 'Knew About Fonts' },
      { icon: 'fa-square-check', feature: 'Winning Metric for Your Startup' },
      { icon: 'fa-circle-xmark', feature: 'Your Startup' },
    ]
  },
  {
    delay: ".9s",
    title: "Premium Plan",
    price: "89",
    feature_data: [
      { icon: 'fa-square-check', feature: 'Mistakes To Avoid' },
      { icon: 'fa-square-check', feature: 'Your Startup' },
      { icon: 'fa-square-check', feature: 'Knew About Fonts' },
      { icon: 'fa-square-check', feature: 'Winning Metric for Your Startup' },
      { icon: 'fa-square-check', feature: 'Your Startup' },
    ]
  },


]
export default price_data
