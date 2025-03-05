interface ScraperConfig {
  microsoft: {
    baseUrl: string;
    maxPages: number;
    userAgent: string;
  };
  google: {
    baseUrl: string;
    maxPages: number;
    userAgent: string;
  };
  amazon: {
    baseUrl: string;
    maxPages: number;
    userAgent: string;
  };
  common: {
    timeout: number;
    retryCount: number;
    retryDelay: number;
  };
}

const scraperConfig: ScraperConfig = {
  microsoft: {
    baseUrl: "https://jobs.careers.microsoft.com/global/en/search",

    // maxPages: 84,
    maxPages: 50,
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36",
  },
  google: {
    baseUrl: "https://www.google.com/about/careers/applications/jobs/results",
    // maxPages: 149,
    maxPages: 50,
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.109 Safari/537.36",
  },
  amazon: {
    baseUrl: "https://www.amazon.jobs/en/search",

    // maxPages: 1000,
    maxPages: 200,
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.80 Safari/537.36",
  },
  common: {
    timeout: 30000,
    retryCount: 3,
    retryDelay: 2000,
  },
};

export default scraperConfig;
