import { Product } from '../types/product';
import personalFinanceImg from 'figma:asset/012924ff644f6d49bc575472cf3a7a4b50a42a23.png';
import flowOfMoneyImg from 'figma:asset/091f88f8ed4dbb0cb3ac41aa7c49823507f6a122.png';
import assetAndLiabilitiesImg from 'figma:asset/58ded430d946d5b5d5f8a4fa9eb979a55839b151.png';
import supplyAndDemandsImg from 'figma:asset/e1528c24563d661db537182ba3e4f46b5dc76de9.png';
import findingInformationImg from 'figma:asset/90325d97cd0dbb66c9f52a70604df1d3a221a3a8.png';
import masterFinancialReportImg from 'figma:asset/950eeaaa89ca1295ec3942e59f78924c3a4a7b13.png';
import buildSmallLlmImg from 'figma:asset/39e9e431d79aa24da6baf94ac39b65072deea2f5.png';
import usedAiInCareerImg from 'figma:asset/70e027e6c3d91f074f2833f6c3975190de74a8dc.png';
import overcomeNervousImg from 'figma:asset/35dc0cda26b366c8b4bee24d1005cfa3bf7d086c.png';
import braveSuggestionImg from 'figma:asset/67c875e7c920cf8f3811385f85a2f851acb191de.png';
import fastRespondImg from 'figma:asset/f07125f241a81ee860e920b656aa571760b80f1d.png';
import gymSkillsImg from 'figma:asset/f435d069db3004981956b7a71f4ec12af32fcac0.png';
import dietImg from 'figma:asset/0c87f14778c447b35cefe0f78db58212fc4919be.png';
import healthyLifestyleImg from 'figma:asset/3688850c181c539d73d4f52c278e8248815ea8f1.png';

export const products: Product[] = [
  {
    id: '1',
    name: 'SUPPLY AND DEMANDS',
    brand: 'FINANCE',
    price: 800,
    image: supplyAndDemandsImg
  },
  {
    id: '2',
    name: 'MASTER FINANCIAL REPORT',
    brand: 'STOCK',
    price: 1500,
    image: masterFinancialReportImg
  },
  {
    id: '3',
    name: 'USED AI IN YOUR CAREER',
    brand: 'AI',
    price: 3000,
    image: usedAiInCareerImg
  },
  {
    id: '4',
    name: 'PERSONAL FINANCE',
    brand: 'FINANCE',
    price: 300,
    image: personalFinanceImg
  },
  {
    id: '5',
    name: 'OVERCOME NERVOUS WHEN SPEEK AT PUBLIC',
    brand: 'CONFIDENCE',
    price: 1500,
    image: overcomeNervousImg
  },
  {
    id: '6',
    name: 'DAILY GYM SKILLS',
    brand: 'HEALTHCARE',
    price: 1000,
    image: gymSkillsImg
  },
  {
    id: '7',
    name: 'TECHNICAL ANALYSIS',
    brand: 'STOCK',
    price: 1500,
    image: 'https://images.unsplash.com/photo-1767424196045-030bbde122a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdG9jayUyMG1hcmtldCUyMHRlY2huaWNhbCUyMGFuYWx5c2lzJTIwY2hhcnR8ZW58MXx8fHwxNzc1Mzc3NTM1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  {
    id: '8',
    name: 'BRAVE TO GIVE SUGGESTION IN CROUP DISCUSSION',
    brand: 'CONFIDENCE',
    price: 800,
    image: braveSuggestionImg
  },
  {
    id: '9',
    name: 'ASSET AND LIABILITIES',
    brand: 'FINANCE',
    price: 500,
    image: assetAndLiabilitiesImg
  },
  {
    id: '10',
    name: 'DIET FOR ALL AGE GROUP',
    brand: 'HEALTHCARE',
    price: 800,
    image: dietImg
  },
  {
    id: '11',
    name: 'BUILD YOUR OWN SMALL LLM',
    brand: 'AI',
    price: 5000,
    image: buildSmallLlmImg
  },
  {
    id: '12',
    name: 'MORE FAST RESPOND TIME IN MEETING',
    brand: 'CONFIDENCE',
    price: 1000,
    image: fastRespondImg
  },
  {
    id: '13',
    name: 'FLOW OF MONEY',
    brand: 'FINANCE',
    price: 800,
    image: flowOfMoneyImg
  },
  {
    id: '14',
    name: 'FINDING INFORMATION',
    brand: 'STOCK',
    price: 3000,
    image: findingInformationImg
  },
  {
    id: '15',
    name: 'HEALTHY LIFESTYLE',
    brand: 'HEALTHCARE',
    price: 500,
    image: healthyLifestyleImg
  }
];

export const luxuryBrands = ['FINANCE', 'STOCK', 'AI', 'CONFIDENCE', 'HEALTHCARE'];

export const priceRanges = [
  { label: 'Under ♦50', min: 0, max: 49 },
  { label: '♦50-♦100', min: 50, max: 100 },
  { label: '♦100-♦150', min: 100, max: 150 },
  { label: '♦150+', min: 150, max: 5000 }
];
