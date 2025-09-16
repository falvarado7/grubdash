# ===== Build stage =====
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# copy sln + proj files first (better layer caching)
COPY GrubDash.sln ./
COPY GrubDash.Api/GrubDash.Api.csproj GrubDash.Api/
COPY GrubDash.Data/GrubDash.Data.csproj GrubDash.Data/
COPY GrubDash.Domain/GrubDash.Domain.csproj GrubDash.Domain/

RUN dotnet restore GrubDash.sln

# now copy the rest and publish
COPY . .
RUN dotnet publish GrubDash.Api/GrubDash.Api.csproj -c Release -o /app/publish

# ===== Runtime stage =====
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
# Kestrel must listen on 0.0.0.0:8080 for Fly
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "GrubDash.Api.dll"]