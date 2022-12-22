from algoliasearch.search_client import SearchClient

# Connect and authenticate with your Algolia app
client = SearchClient.create("CS1MDMNJTO", "a557ff5a6549bba6e522300df6171c85")

# Create a new index and add a record
index = client.init_index("all_rounds")

# Search the index and print the results
results = index.search("Cal MR")
print(results["hits"][0])